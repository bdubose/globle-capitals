import crypto from "crypto-js";
import dayjs from "dayjs";

describe("Play the game", () => {
  // beforeEach(())

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

  it("plays a game with many guesses", () => {
    cy.visit("/");

    cy.fixture("fake_stats").then((oldStats) => {
      const stats = oldStats["statistics"];
      const yesterday = dayjs().subtract(1, "day").toDate();
      stats["lastWin"] = yesterday;
      window.localStorage.setItem("statistics", JSON.stringify(stats));

      const guesses = oldStats["guesses"];
      guesses["expiration"] = yesterday;
      window.localStorage.setItem("guesses", JSON.stringify(guesses));
    });

    cy.intercept("GET", "/.netlify/functions/answer**", (req) => {
      req.reply({
        statusCode: 200,
        fixture: "encrypted_paris.json",
      });
    });
    cy.visit("/game");

    cy.contains("any capital city").should("exist");

    cy.get('[data-cy="guesser"]').type("los angeles{enter}");
    cy.contains("Los Angeles is not a capital city").should("exist");

    cy.get('[data-cy="guesser"]').type("toronto{enter}");
    cy.contains("Toronto is not Canada's primary capital.").should("exist");

    cy.get('[data-cy="guesser"]').type("delhi{enter}");
    cy.contains("next guess").should("exist");

    cy.get('[data-cy="guesser"]').type("london{enter}");
    cy.contains("London is warmer").should("exist");

    cy.get('[data-cy="guesser"]').type("santiago{enter}");
    cy.contains("Santiago is cooler").should("exist");

    cy.get('[data-cy="guesser"]').type("paris{enter}");
    cy.contains("The Mystery Capital is Paris").should("exist");

    cy.contains("Statistics").should("exist");
    cy.get('[data-cy="games-won"]').should("contain", 5);
    cy.get('[data-cy="current-streak"]').should("contain", 3);

    // Check that the stats remain when you leave and come back
    cy.visit("/");
    cy.visit("/game");
    cy.contains("Santiago").should("exist");
  });

  it("breaks a streak", () => {
    cy.visit("/");

    cy.fixture("fake_stats").then((oldStats) => {
      const stats = oldStats["statistics"];
      const yesterday = dayjs().subtract(10, "day").toDate();
      stats["lastWin"] = yesterday;
      window.localStorage.setItem("statistics", JSON.stringify(stats));
    });

    cy.intercept("GET", "/.netlify/functions/answer**", (req) => {
      req.reply({
        statusCode: 200,
        fixture: "encrypted_paris.json",
      });
    });
    cy.visit("/game");

    cy.get('[data-cy="guesser"]').type("paris{enter}");
    cy.contains("The Mystery Capital is Paris").should("exist");

    cy.contains("Statistics").should("exist");
    cy.get('[data-cy="games-won"]').should("contain", 5);
    cy.get('[data-cy="current-streak"]').should("contain", 1);
  });
});

export default {};
