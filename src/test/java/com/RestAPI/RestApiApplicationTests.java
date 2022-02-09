package com.RestAPI;

import static org.junit.jupiter.api.Assertions.assertEquals;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@SpringBootTest
class RestApiApplicationTests {

	@Autowired
	StatusCheck statuscheck;
	
	@Test
	public void applicationtest(){
		ResponseEntity<String> response =  statuscheck.Hello();
		
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

}
