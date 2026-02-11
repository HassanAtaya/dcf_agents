package com.valsoft.library.config;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(ResponseStatusException ex) {
        return new ResponseEntity<>(
            Map.of("status", ex.getStatusCode().value(), "error", ex.getReason()),
            ex.getStatusCode()
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return new ResponseEntity<>(
            Map.of("status", 401, "error", "Invalid username or password"),
            HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(
            Map.of("status", 403, "error", "Forbidden"),
            HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex) {
        return new ResponseEntity<>(
            Map.of("status", 500, "error", ex.getMessage() != null ? ex.getMessage() : "Internal Server Error"),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
