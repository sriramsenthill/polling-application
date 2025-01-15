use actix_web::error::ErrorUnauthorized;
use actix_web::{
    body::MessageBody,
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    http::header::AUTHORIZATION,
    Error, HttpMessage,
};
use futures::future::{ok, LocalBoxFuture, Ready};
use std::rc::Rc;

use crate::models::auth_jwt::decode_jwt;

// Middleware struct
pub struct CheckAuth;

// Implement `Transform` trait for `CheckAuth`
impl<S, B> Transform<S, ServiceRequest> for CheckAuth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = CheckAuthMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(CheckAuthMiddleware {
            service: Rc::new(service),
        })
    }
}

// Inner middleware struct to hold the service
pub struct CheckAuthMiddleware<S> {
    service: Rc<S>,
}

// Implement `Service` trait for `CheckAuthMiddleware`
impl<S, B> Service<ServiceRequest> for CheckAuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(
        &self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Get the Authorization header
        let auth_header = req.headers().get(AUTHORIZATION).cloned();

        // Clone the service to avoid moving it into the async block
        let service = Rc::clone(&self.service);

        Box::pin(async move {
            if let Some(auth) = auth_header {
                if let Ok(auth_str) = auth.to_str() {
                    let token = auth_str.replace("Bearer ", "");
                    // Attempt to decode the JWT token
                    if let Ok(claim) = decode_jwt(token) {
                        println!("after decoding : {:#?}", claim);
                        // Insert the claims into request extensions
                        req.extensions_mut().insert(claim.claims);

                        // Call the next middleware or handler in the chain
                        return service.call(req).await;
                    }
                }
            }

            // Return Unauthorized response if auth is missing or invalid
            Err(ErrorUnauthorized("Unauthorized"))
        })
    }
}
