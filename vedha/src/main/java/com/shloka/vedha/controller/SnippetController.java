package com.shloka.vedha.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/snippets")
public class SnippetController {

    @GetMapping
    public String listAll() {
        return "Showing all snippets...";
    }

    @GetMapping("/{id}")
    public String viewSnippet(@PathVariable Long id) {
        return "Displaying snippet with ID: " + id;
    }
}