package com.ai.Resume.analyser.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity

public class previousTable {

    @Id
    private String email;

    private int score;
    private int atsoptimizationscore;
    private String roles;

    @ElementCollection
    @Column(columnDefinition = "TEXT")
    private List<String> pros;

    @ElementCollection
    @Column(columnDefinition = "TEXT")
    private List<String> cons;

    @ElementCollection
    @Column(columnDefinition = "TEXT")
    private List<String> suggestions;

}
