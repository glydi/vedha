package com.shloka.vedha.repo;

import com.shloka.vedha.model.CodeSnippet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodeSnippetRepository extends JpaRepository<CodeSnippet, Long> {
    List<CodeSnippet> findByIsPublicTrue();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s FROM CodeSnippet s LEFT JOIN s.owner o LEFT JOIN s.sharedWith sw WHERE s.isPublic = true OR o.username = :username OR sw.username = :username")
    List<CodeSnippet> findVisibleToUser(@org.springframework.data.repository.query.Param("username") String username);
}
