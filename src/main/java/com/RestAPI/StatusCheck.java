package com.RestAPI;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RequestMapping("/")
@CrossOrigin("*")
@RestController
public class StatusCheck {
	
	@GetMapping("/getstatus")
	public ResponseEntity<String> Hello() {
		
		return ResponseEntity.ok()
				.header("status okay", "200")
				.body("null");
}
}