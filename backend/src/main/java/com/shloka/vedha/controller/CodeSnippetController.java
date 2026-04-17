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
    public List<CodeSnippet> getAll(java.security.Principal principal) {
        if (principal == null) {
            return service.getVisibleToAll();
        }
        return service.getVisibleToUser(principal.getName());
    }

    @GetMapping("/{id}")
    public CodeSnippet getById(@PathVariable Long id, java.security.Principal principal) {
        CodeSnippet snippet = service.getById(id).orElseThrow();
        if (snippet.isPublic() || (principal != null && snippet.getOwner() != null &&
                snippet.getOwner().getUsername().equals(principal.getName()))) {
            return snippet;
        }
        throw new RuntimeException("ACCESS_DENIED");
    }

    @PutMapping("/{id}")
    public CodeSnippet update(@PathVariable Long id, @RequestBody CodeSnippet snippet,
            java.security.Principal principal) {
        if (principal == null)
            throw new RuntimeException("AUTHENTICATION_REQUIRED");
        CodeSnippet existing = service.getById(id).orElseThrow();
        if (existing.getOwner() != null && !existing.getOwner().getUsername().equals(principal.getName())) {
            throw new RuntimeException("OWNERSHIP_REQUIRED");
        }
        return service.update(id, snippet);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, java.security.Principal principal) {
        if (principal == null)
            throw new RuntimeException("AUTHENTICATION_REQUIRED");
        CodeSnippet existing = service.getById(id).orElseThrow();
        if (existing.getOwner() != null && !existing.getOwner().getUsername().equals(principal.getName())) {
            throw new RuntimeException("OWNERSHIP_REQUIRED");
        }
        service.delete(id);
    }

}
