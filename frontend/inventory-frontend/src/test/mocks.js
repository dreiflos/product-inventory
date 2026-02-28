
export const mockProducts = [
  {
    id: 1,
    name: 'Widget Alpha',
    price: 150.00,
    compositions: [
      { id: 1, rawMaterialId: 1, rawMaterialName: 'Steel', requiredQuantity: 5 },
    ],
  },
  {
    id: 2,
    name: 'Widget Beta',
    price: 80.00,
    compositions: [],
  },
]

export const mockRawMaterials = [
  { id: 1, name: 'Steel', stockQuantity: 100 },
  { id: 2, name: 'Aluminum', stockQuantity: 8 },
  { id: 3, name: 'Plastic', stockQuantity: 200 },
]

export const mockSuggestions = {
  suggestedItems: [
    { productName: 'Widget Alpha', quantityToProduce: 20, subtotal: 3000.00 },
    { productName: 'Widget Beta',  quantityToProduce: 5,  subtotal: 400.00  },
  ],
  totalEstimatedValue: 3400.00,
}
