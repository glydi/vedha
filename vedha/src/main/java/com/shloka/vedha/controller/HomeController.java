package com.shloka.vedha.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "Welcome to Vedha: Your Online Code Snippet Manager is LIVE!";
    }

    @GetMapping("/qb")
    public String qb() {
        return "OSHO is great.";
    }
}