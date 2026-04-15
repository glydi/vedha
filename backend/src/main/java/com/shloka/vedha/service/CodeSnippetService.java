package com.shloka.vedha.service;

import com.shloka.vedha.model.CodeSnippet;
import com.shloka.vedha.repo.CodeSnippetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CodeSnippetService {

    private final CodeSnippetRepository repository;

    public CodeSnippetService(CodeSnippetRepository repository) {
        this.repository = repository;
    }

    // Create
    public CodeSnippet save(CodeSnippet snippet) {
        return repository.save(snippet);
    }

    // Read all
    public List<CodeSnippet> getAll() {
        return repository.findAll();
    }

    // Read by id
    public Optional<CodeSnippet> getById(Long id) {
        return repository.findById(id);
    }

    // Update
    public CodeSnippet update(Long id, CodeSnippet updatedSnippet) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setTitle(updatedSnippet.getTitle());
                    existing.setCode(updatedSnippet.getCode());
                    existing.setLanguage(updatedSnippet.getLanguage());
                    existing.setDescription(updatedSnippet.getDescription());
                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Snippet not found"));
    }

    // Delete
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
