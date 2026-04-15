package com.shloka.vedha.repo;

import com.shloka.vedha.model.CodeSnippet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CodeSnippetRepository extends JpaRepository<CodeSnippet, Long> {
}
