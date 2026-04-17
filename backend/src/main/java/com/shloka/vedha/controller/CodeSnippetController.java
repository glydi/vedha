package com.shloka.vedha.controller;

import com.shloka.vedha.model.CodeSnippet;
import com.shloka.vedha.service.CodeSnippetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snippets")
@CrossOrigin
public class CodeSnippetController {

    private final CodeSnippetService service;
    private final com.shloka.vedha.repo.UserRepository userRepository;

    public CodeSnippetController(CodeSnippetService service, com.shloka.vedha.repo.UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @PostMapping
    public CodeSnippet create(@RequestBody CodeSnippet snippet, java.security.Principal principal) {
        if (principal != null) {
            userRepository.findByUsername(principal.getName()).ifPresent(snippet::setOwner);
        }
        return service.save(snippet);
    }

    @GetMapping
    public List<CodeSnippet> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public CodeSnippet getById(@PathVariable Long id) {
        return service.getById(id).orElseThrow();
    }

    @PutMapping("/{id}")
    public CodeSnippet update(@PathVariable Long id, @RequestBody CodeSnippet snippet) {
        return service.update(id, snippet);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
