package com.blindbox.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("t_visit_log")
public class VisitLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String pagePath;
    private String pageName;
    private Long userId;
    private String ip;
    private Integer durationSec;
    private LocalDate visitDate;
    private LocalDateTime createdAt;
}
