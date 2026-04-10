package com.vedha.snippetmanager.repository;

import com.vedha.snippetmanager.model.Snippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SnippetRepository extends JpaRepository<Snippet, Long> {
    List<Snippet> findByLanguage(String language);

    List<Snippet> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
}
