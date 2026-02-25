package com.example.project_inventory.domain.service;

import com.example.project_inventory.domain.model.Product;
import com.example.project_inventory.domain.repository.ProductRepository;
import com.example.project_inventory.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;

    public List<Product> findAll() {
        return productRepository.findAllByOrderByPriceDesc();
    }

    @Transactional
    public Product save(Product product) {
        if (product.getCompositions() != null) {
            product.getCompositions().forEach(comp -> comp.setProduct(product));
        }
        return productRepository.save(product);
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public ProductDTO convertToDto(Product product) {
        return modelMapper.map(product, ProductDTO.class);
    }

    @Transactional
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    @Transactional
    public Product update(Long id, Product productDetails) {
        Product product = findById(id);
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());

        if (productDetails.getCompositions() != null) {
            product.getCompositions().clear();
            product.getCompositions().addAll(productDetails.getCompositions());
            product.getCompositions().forEach(c -> c.setProduct(product));
        }

        return productRepository.save(product);
    }
}