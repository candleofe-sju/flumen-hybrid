package com.eugentia.app.data.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class BackendService {

	@Async
	public CompletableFuture<String> longRunningTask() {
		longRunning();
		return CompletableFuture.completedFuture("Some result");
	}

	protected void longRunning() {
		try {
			// Simulate a long-running task
			Thread.sleep(6000);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}
}