package com.cet.cet_backend.mappers;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Category;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.mappers.impl.ExpenseMapperImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ExpenseMapperImpl.
 * Verifies accurate field mapping between ExpenseEntity and ExpenseDto.
 */
public class ExpenseMapperTest {

    private ExpenseMapperImpl expenseMapper;

    @BeforeEach
    void setUp() {
        ModelMapper modelMapper = new ModelMapper();
        expenseMapper = new ExpenseMapperImpl(modelMapper);
    }

    /**
     * Tests mapping from ExpenseEntity to ExpenseDto.
     */
    @Test
    void mapTo_ConvertsEntityToDtoSuccessfully() {
        ExpenseEntity entity = ExpenseEntity.builder()
                .id(10L)
                .description("Taxi Fare")
                .category(Category.TRANSPORTATION)
                .amount(new BigDecimal("25.50"))
                .date(LocalDate.now())
                .status(Status.APPROVED)
                .comment("Client meeting")
                .build();

        ExpenseDto dto = expenseMapper.mapTo(entity);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals("Taxi Fare", dto.getDescription());
        assertEquals(Category.TRANSPORTATION, dto.getCategory());
        assertEquals(new BigDecimal("25.50"), dto.getAmount());
    }

    /**
     * Tests mapping from ExpenseDto to ExpenseEntity.
     */
    @Test
    void mapFrom_ConvertsDtoToEntitySuccessfully() {
        ExpenseDto dto = ExpenseDto.builder()
                .description("Course Training")
                .category(Category.EDUCATION)
                .amount(new BigDecimal("300.00"))
                .date(LocalDate.now())
                .build();

        ExpenseEntity entity = expenseMapper.mapFrom(dto);

        assertNotNull(entity);
        assertEquals("Course Training", entity.getDescription());
        assertEquals(Category.EDUCATION, entity.getCategory());
        assertEquals(new BigDecimal("300.00"), entity.getAmount());
    }
}