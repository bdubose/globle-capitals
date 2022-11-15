import crypto from "crypto-js";

describe("Play the game", () => {
  it("plays today's game", () => {
    cy.intercept("GET", "/.netlify/functions/answer**").as("answer");

    cy.visit("/game");

    cy.wait("@answer")
      .its("response.body")
      .then((body) => {
        const data = JSON.parse(body);
        const bytes = crypto.AES.decrypt(data.answer, Cypress.env("KEY"));
        const answerObj = JSON.parse(bytes.toString(crypto.enc.Utf8)) as City;
        console.log(answerObj);
        const answerCity = answerObj.city;
        cy.get('[data-cy="guesser"]').type(`${answerCity}{enter}`);
      });

    cy.contains("Statistics").should("exist");
  });

  it("plays the game", () => {
    cy.intercept("GET", "/.netlify/functions/answer**", (req) => {
      req.reply({
        statusCode: 200,
        fixture: "encrypted_paris.json",
      });
    });
    cy.visit("/game");

    cy.contains("any capital city").should("exist");

    cy.get('[data-cy="guesser"]').type("ottawa{enter}");
    cy.contains("next guess").should("exist");

    cy.get('[data-cy="guesser"]').type("london{enter}");
    cy.contains("London is warmer").should("exist");

    cy.get('[data-cy="guesser"]').type("santiago{enter}");
    cy.contains("Santiago is cooler").should("exist");

    cy.get('[data-cy="guesser"]').type("paris{enter}");
    cy.contains("The Mystery Capitol is Paris").should("exist");

    cy.contains("Statistics").should("exist");
  });

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
    cy.contains("The Mystery Capitol is Paris").should("exist");

    cy.contains("Play again?").should("exist");
    cy.get('[data-cy="yes-btn"]').click();
    cy.contains("any capital city").should("exist");
  });
});

export default {};
