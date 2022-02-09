package com.RestAPI;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

@Service
public class StatusCheckService {

	@GetMapping("/getstatus")
	public ResponseEntity<String> Hello() {
		
		return ResponseEntity.ok()
				.header("status okay", "200")
				.body("null");

	}
	}
