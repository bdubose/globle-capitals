describe("Play a practice game", () => {
  it("plays the game in practice mode", () => {
    cy.fixture("paris").then((paris) => {
      window.localStorage.setItem("practice", JSON.stringify(paris));
    });

    cy.visit("/practice");
    cy.contains("any capital city").should("exist");

    cy.get('[data-cy="guesser"]').type("ottawa{enter}");
    cy.contains("next guess").should("exist");

    cy.get('[data-cy="guesser"]').type("london{enter}");
    cy.contains("London is warmer").should("exist");

    cy.get('[data-cy="guesser"]').type("santiago{enter}");
    cy.contains("Santiago is cooler").should("exist");

    cy.get('[data-cy="guesser"]').type("paris{enter}");
    cy.contains("The Mystery Capital is Paris").should("exist");

    cy.contains("Play again?").should("exist");
    cy.get('[data-cy="yes-btn"]').click();
    cy.contains("any capital city").should("exist");

    cy.contains("Reveal answer").click();
    cy.contains("The Mystery Capital is").should("exist");

    cy.wait(1000);
    cy.contains("Play again?").should("exist");
    cy.get('[data-cy="no-btn"]').click();
    cy.url().should("not.contain", "practice");
  });
});

export default {};
