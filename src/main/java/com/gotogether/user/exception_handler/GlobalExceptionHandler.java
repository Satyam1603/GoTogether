package com.gotogether.user.exception_handler;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.naming.AuthenticationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.gotogether.user.custom_exception.ResourceNotFoundException;
import com.gotogether.user.dto.ApiResponse;


@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException e) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage(), "Failed"));
	}

	// add exception handling method - to handle auth exc

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<?> handleAuthenticationException(AuthenticationException e) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(e.getMessage(), "Failed"));
	}
	
	@ExceptionHandler(RuntimeException.class)
	//@ResponseStatus
	public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(e.getMessage(), "Failed"));
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
		System.out.println("in handle @Valid ");
		//1. get list of rejected fields
		List<FieldError> fieldErrors = e.getFieldErrors();
		//2. Covert it to Map <Key - field Name , Value - err mesg>
		Map<String, String> errorFieldMap = fieldErrors.stream() //Stream<FieldError>
		.collect(Collectors.toMap(FieldError::getField,FieldError::getDefaultMessage));//f -> f.getField(), f -> f.getDefaultMessage()
		
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorFieldMap);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage(), "Failed"));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleGenericException(Exception e) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse("An unexpected error occurred: " + e.getMessage(), "Failed"));
	}
}