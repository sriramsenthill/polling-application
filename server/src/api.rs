use actix_web::{web, HttpResponse, Responder};
use bson::{doc, oid::ObjectId, Bson};
use chrono::Utc;
use futures::StreamExt;

use crate::{
    db::Database,
    error::ApiError,
    models::{CreateUser, UpdateUser, User},
};

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/users", web::post().to(create_user))
            .route("/users", web::get().to(list_users))
            .route("/users/{id}", web::get().to(get_user))
            .route("/users/{id}", web::put().to(update_user))
            .route("/users/{id}", web::delete().to(delete_user)),
    );
}

async fn create_user(
    db: web::Data<Database>,
    user_data: web::Json<CreateUser>,
) -> Result<impl Responder, ApiError> {
    let collection = db.get_database().collection::<User>("users");

    let user = User {
        id: None,
        name: user_data.name.clone(),
        email: user_data.email.clone(),
        created_at: Utc::now(),
    };

    let result = collection.insert_one(user, None).await?;

    Ok(HttpResponse::Created().json(doc! {
        "id": result.inserted_id.as_object_id().unwrap()
    }))
}

async fn list_users(db: web::Data<Database>) -> Result<impl Responder, ApiError> {
    let collection = db.get_database().collection::<User>("users");
    let mut cursor = collection.find(None, None).await?;

    let mut users = Vec::new();
    while let Some(user) = cursor.next().await {
        users.push(user?);
    }

    Ok(HttpResponse::Ok().json(users))
}

async fn get_user(
    db: web::Data<Database>,
    id: web::Path<String>,
) -> Result<impl Responder, ApiError> {
    let object_id = ObjectId::parse_str(id.as_str()).map_err(|_| ApiError::InvalidId)?;
    let collection = db.get_database().collection::<User>("users");

    let user = collection
        .find_one(doc! { "_id": object_id }, None)
        .await?
        .ok_or(ApiError::NotFound)?;

    Ok(HttpResponse::Ok().json(user))
}

async fn update_user(
    db: web::Data<Database>,
    id: web::Path<String>,
    update_data: web::Json<UpdateUser>,
) -> Result<impl Responder, ApiError> {
    let object_id = ObjectId::parse_str(id.as_str()).map_err(|_| ApiError::InvalidId)?;
    let collection = db.get_database().collection::<User>("users");

    let mut update = doc! { "$set": {} };

    if let Some(name) = &update_data.name {
        update
            .get_document_mut("$set")
            .unwrap()
            .insert("name", name);
    }

    if let Some(email) = &update_data.email {
        update
            .get_document_mut("$set")
            .unwrap()
            .insert("email", email);
    }

    let result = collection
        .update_one(doc! { "_id": object_id }, update, None)
        .await?;

    if result.modified_count == 0 {
        return Err(ApiError::NotFound);
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "modified_count": result.modified_count
    })))
}

async fn delete_user(
    db: web::Data<Database>,
    id: web::Path<String>,
) -> Result<impl Responder, ApiError> {
    let object_id = ObjectId::parse_str(id.as_str()).map_err(|_| ApiError::InvalidId)?;
    let collection = db.get_database().collection::<User>("users");

    let result = collection
        .delete_one(doc! { "_id": object_id }, None)
        .await?;

    if result.deleted_count == 0 {
        return Err(ApiError::NotFound);
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "deleted_count": result.deleted_count
    })))
}
