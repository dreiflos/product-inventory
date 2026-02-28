describe('Raw Materials Page', () => {

  beforeEach(() => {
    cy.goToMaterials()
    cy.contains('Steel').should('be.visible')
  })

  it('should display the page title', () => {
    cy.contains('Matérias Primas').should('be.visible')
  })

  it('should display materials loaded from the API', () => {
    cy.contains('Steel').should('be.visible')
    cy.contains('Aluminum').should('be.visible')
    cy.contains('Plastic').should('be.visible')
  })

  it('should display stock quantities', () => {
    cy.contains('100').should('be.visible')
    cy.contains('8').should('be.visible')
    cy.contains('200').should('be.visible')
  })

  it('should display "Baixo" badge for Aluminum (stock 8)', () => {
    cy.contains('Baixo').should('be.visible')
  })

  it('should display "Adequado" badges for other materials', () => {
    cy.contains('Adequado').should('be.visible')
  })

  it('should display KPI cards with correct values', () => {
    cy.contains('Total de Insumos').parent().contains('3').should('be.visible')
    cy.contains('Estoque Baixo').parent().contains('1').should('be.visible')
    cy.contains('Estoque Adequado').parent().contains('2').should('be.visible')
  })

  it('should open create modal on button click', () => {
    cy.contains('button', 'Nova').click()
    cy.contains('h2', 'Nova').should('be.visible')
  })

  it('should show validation error on empty form submit', () => {
    cy.contains('button', 'Nova').click()
    cy.contains('h2', 'Nova').should('be.visible')
    cy.contains('button', 'Criar Insumo').should('be.visible').click()
    cy.contains('Nome é obrigatório').should('be.visible')
  })

  it('should create a material successfully', () => {
    const newMaterial = { id: 10, name: 'Copper', stockQuantity: 50 }
    cy.intercept('POST', '/api/raw-materials', { statusCode: 201, body: newMaterial }).as('createMaterial')

    cy.contains('button', 'Nova').click()
    cy.contains('h2', 'Nova').should('be.visible')
    cy.get('input[placeholder="Ex: Aço carbono"]').should('be.visible').type('Copper')
    cy.get('input[placeholder="0"]').should('be.visible').type('50')
    cy.contains('button', 'Criar Insumo').click()

    cy.wait('@createMaterial').then(interception => {
      expect(interception.request.body.name).to.eq('Copper')
      expect(Number(interception.request.body.stockQuantity)).to.eq(50)
    })

    cy.contains('h2', 'Nova').should('not.exist')
  })

  it('should open edit modal with pre-filled data', () => {
    cy.get('[title="Editar"]').should('be.visible').first().click()
    cy.contains('h2', 'Editar').should('be.visible')
    cy.get('input[placeholder="Ex: Aço carbono"]').should('have.value', 'Steel')
    cy.get('input[placeholder="0"]').should('have.value', '100')
  })

  it('should update a material via the edit modal', () => {
    const updated = { id: 1, name: 'Steel Premium', stockQuantity: 150 }
    cy.intercept('PUT', '/api/raw-materials/1', { statusCode: 200, body: updated }).as('updateMaterial')

    cy.get('[title="Editar"]').should('be.visible').first().click()
    cy.contains('h2', 'Editar').should('be.visible')

    cy.get('input[placeholder="Ex: Aço carbono"]').clear().type('Steel Premium')
    cy.get('input[placeholder="0"]').clear().type('150')
    cy.contains('button', 'Salvar Alterações').click()

    cy.wait('@updateMaterial').then(interception => {
      expect(interception.request.body.name).to.eq('Steel Premium')
    })

    cy.contains('h2', 'Editar').should('not.exist')
  })

  it('should open confirm modal when clicking delete', () => {
    cy.get('[title="Excluir"]').should('be.visible').first().click()
    cy.contains('Confirmar exclusão').should('be.visible')
    cy.contains('Steel').should('be.visible')
  })

  it('should cancel deletion and keep the material', () => {
    cy.get('[title="Excluir"]').should('be.visible').first().click()
    cy.contains('Confirmar exclusão').should('be.visible')
    cy.contains('button', 'Cancelar').click()
    cy.contains('Confirmar exclusão').should('not.exist')
    cy.contains('Steel').should('be.visible')
  })

  it('should delete a material on confirm', () => {
    cy.intercept('DELETE', '/api/raw-materials/1', { statusCode: 204 }).as('deleteMaterial')

    cy.get('[title="Excluir"]').should('be.visible').first().click()
    cy.contains('Confirmar exclusão').should('be.visible')
    cy.get('.fixed').contains('button', 'Excluir').click()

    cy.wait('@deleteMaterial')
  })
})
