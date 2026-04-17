package com.shloka.vedha.repo;

import com.shloka.vedha.model.CodeSnippet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodeSnippetRepository extends JpaRepository<CodeSnippet, Long> {
    List<CodeSnippet> findByIsPublicTrue();

    List<CodeSnippet> findByIsPublicTrueOrOwnerUsername(String username);
}
