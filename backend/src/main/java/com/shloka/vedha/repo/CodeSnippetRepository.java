package com.shloka.vedha.repo;

import com.shloka.vedha.model.CodeSnippet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodeSnippetRepository extends JpaRepository<CodeSnippet, Long> {
    List<CodeSnippet> findByIsPublicTrue();

    @org.springframework.data.jpa.repository.Query("SELECT s FROM CodeSnippet s LEFT JOIN s.sharedWith sw WHERE s.isPublic = true OR s.owner.username = :username OR sw.username = :username")
    List<CodeSnippet> findVisibleToUser(@org.springframework.data.repository.query.Param("username") String username);
}
