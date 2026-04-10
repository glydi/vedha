package com.vedha.snippetmanager.controller;

import com.vedha.snippetmanager.model.Snippet;
import com.vedha.snippetmanager.repository.SnippetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snippets")
@CrossOrigin(origins = "http://localhost:5173")
public class SnippetController {

    private final SnippetRepository snippetRepository;

    public SnippetController(SnippetRepository snippetRepository) {
        this.snippetRepository = snippetRepository;
    }

    @GetMapping
    public List<Snippet> getAllSnippets() {
        return snippetRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Snippet> getSnippetById(@PathVariable Long id) {
        return snippetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Snippet createSnippet(@RequestBody Snippet snippet) {
        return snippetRepository.save(snippet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Snippet> updateSnippet(@PathVariable Long id, @RequestBody Snippet snippetDetails) {
        return snippetRepository.findById(id)
                .map(snippet -> {
                    snippet.setTitle(snippetDetails.getTitle());
                    snippet.setContent(snippetDetails.getContent());
                    snippet.setLanguage(snippetDetails.getLanguage());
                    snippet.setDescription(snippetDetails.getDescription());
                    snippet.setTags(snippetDetails.getTags());
                    snippet.setPublic(snippetDetails.isPublic());
                    return ResponseEntity.ok(snippetRepository.save(snippet));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSnippet(@PathVariable Long id) {
        return snippetRepository.findById(id)
                .map(snippet -> {
                    snippetRepository.delete(snippet);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Snippet> searchSnippets(@RequestParam String query) {
        return snippetRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }
}
