package com.shloka.vedha.service;

import com.shloka.vedha.model.CodeSnippet;
import com.shloka.vedha.model.Tag;
import com.shloka.vedha.repo.CodeSnippetRepository;
import com.shloka.vedha.repo.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CodeSnippetService {

    private final CodeSnippetRepository repository;
    private final TagRepository tagRepository;

    public CodeSnippetService(CodeSnippetRepository repository, TagRepository tagRepository) {
        this.repository = repository;
        this.tagRepository = tagRepository;
    }

    // Create
    @Transactional
    public CodeSnippet save(CodeSnippet snippet) {
        if (snippet.getTags() != null) {
            Set<Tag> managedTags = snippet.getTags().stream()
                    .map(tag -> tagRepository.findByName(tag.getName())
                            .orElseGet(() -> tagRepository.save(new Tag(tag.getName()))))
                    .collect(Collectors.toSet());
            snippet.setTags(managedTags);
        }
        return repository.save(snippet);
    }

    // Read all visible to anyone
    public List<CodeSnippet> getVisibleToAll() {
        return repository.findByIsPublicTrue();
    }

    // Read all visible to a specific user
    public List<CodeSnippet> getVisibleToUser(String username) {
        return repository.findByIsPublicTrueOrOwnerUsername(username);
    }

    // Read by id
    public Optional<CodeSnippet> getById(Long id) {
        return repository.findById(id);
    }

    // Update
    @Transactional
    public CodeSnippet update(Long id, CodeSnippet updatedSnippet) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setTitle(updatedSnippet.getTitle());
                    existing.setCode(updatedSnippet.getCode());
                    existing.setLanguage(updatedSnippet.getLanguage());
                    existing.setDescription(updatedSnippet.getDescription());
                    existing.setPublic(updatedSnippet.isPublic());

                    if (updatedSnippet.getTags() != null) {
                        Set<Tag> managedTags = updatedSnippet.getTags().stream()
                                .map(tag -> tagRepository.findByName(tag.getName())
                                        .orElseGet(() -> tagRepository.save(new Tag(tag.getName()))))
                                .collect(Collectors.toSet());
                        existing.setTags(managedTags);
                    }

                    return repository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Snippet not found"));
    }

    // Delete
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
