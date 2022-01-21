/// <reference types="cypress" />

describe("authenticated users", () => {
  context("authentication", () => {
    it("should be able to login", () => {
      cy.visit("/login");
      cy.get('input[name="username"]').type("joe");
      cy.get('input[name="password"]').type("joe");
      cy.get('input[type="submit"]').click();
      cy.getCookie("sessionid").should("exist");
    });

    it("should be able to logout", () => {
      cy.login("joe", "joe");
      cy.visit("/");
      cy.contains("a", "Log Out").click();
      cy.getCookie("sessionid").should("not.exist");
    });
  });

  context("logged in", () => {
    context("index page", () => {
      beforeEach(() => {
        cy.login("joe", "joe");
        cy.visit("/");
      });

      it("should display no more than 10 posts", () => {
        cy.get("#post-list-container").should("have.length.at.most", 10);
      });

      it("should be able to create a post", () => {
        cy.get("#content").type("my first post{enter}");
        cy.get("#post-list-container")
          .children()
          .first()
          .contains("my first post")
          .should("exist");
      });

      it("should not be able to create an empty post", () => {
        cy.intercept(/api\/posts\/\d+\/like/).as("like");
        cy.get("#content").type("   ");
        cy.get("input:invalid").should("have.length", 1);
      });

      it("should be able to like a post", () => {
        cy.intercept(/api\/posts\/\d+\/like/).as("like");
        cy.get('[data-likedstatus="false"]')
          .first()
          .click()
          .then(($) => {
            cy.wait("@like").then((req) => {
              expect(req.response.statusCode).to.equal(201);
              expect($.attr("data-likedstatus")).to.equal("true");
            });
          });
      });

      it("should be able to unlike a post", () => {
        cy.intercept(/api\/posts\/\d+\/like/).as("like");
        cy.get('[data-likedstatus="true"]')
          .first()
          .click()
          .then(($) => {
            cy.wait("@like").then((req) => {
              expect(req.response.statusCode).to.equal(200);
              expect($.attr("data-likedstatus")).to.equal("false");
            });
          });
      });

      it.skip("should be able to edit a post", () => {
        cy.get("#content").type("my first post{enter}");
        cy.get("#post-list-container")
          .children()
          .first()
          .contains("my first post");
      });

      it.only("should not be able to edit another users posts", () => {
        cy.get("#content").type("my first post{enter}");
        cy.get("#post-list-container")
          .children()
          .first()
          .contains("my first post");
        cy.pause()
        cy.login("alice", "alice");
        cy.visit("/");
        cy.get("#post-list-container")
          .first()
          .within(($) => {
            cy.contains("Edit").should("not.exist");
          });
      });
    });
  });
  context("profile page", () => {
    it("should be able to follow or unfollow a user", () => {
      cy.login("alice", "alice");
      cy.visit("/users/4/profile");
      cy.get("#follower-count").then(($count) => {
        const countBefore = parseInt($count.text());
        cy.get("#follow-user")
          .should("exist")
          .click()
          .then(($btn) => {
            const toFollow = $btn.attr("data-followed-status") == "true" ? true : false
            const countAfter = parseInt($count.text());
            expect(countAfter).to.equal(toFollow ? countBefore + 1 : countBefore - 1);
          });
      });
    });

    it("should not be able to follow themselves", () => {
      cy.login("joe", "joe");
      cy.visit("/users/4/profile");
      cy.contains("button", /(Follow|Unfollow)/).should("not.exist");
    });

    it("should display no more than 10 posts", () => {
      cy.login("joe", "joe");
      cy.visit("/users/4/profile");
      cy.get("#post-list-container").should("have.length.at.most", 10);
    });
  });
  context("following page", () => {
    it("should display no more than 10 posts", () => {
      cy.login("joe", "joe");
      cy.visit("/users/4/profile");
      cy.get("#post-list-container").should("have.length.at.most", 10);
    });
  })
});
