package com.example.project_inventory.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.Instant;

@Data
@AllArgsConstructor
public class StandardError {
    private Instant timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
}
