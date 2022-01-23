/// <reference types="cypress" />
import faker from 'faker'

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
        cy.get("#content").type("my first post")
        cy.get('#new-post-form').submit()
        cy.get("#post-list-container")
          .children()
          .first()
          .contains("my first post")
          .should("exist");
      });

      it("should not be able to create an empty post", () => {
        cy.intercept(/api\/posts\/\d+\/like/).as("like");
        cy.get("#content").type("   ")
        cy.get('#new-post-form').submit();
        cy.get("#modal").should("be.visible");
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

      it("should be able to delete a post", () => {
        const postText = faker.lorem.sentence()
        cy.get("#content").type(postText);
        cy.get('#new-post-form').submit()
        cy.get("#post-list-container")
          .children()
          .first()
          .should("contain", postText)
          .within($=> {
            cy.get('[id*="post-delete"]').click()
          })
        cy.contains(postText).should("not.exist")
      })

      it("should not be able to delete another users posts", () => {
        const postText = faker.lorem.sentence()
        cy.get("#content").type(postText)
        cy.get('#new-post-form').submit();
        cy.get("#post-list-container")
          .children()
          .first()
          .should("contain", postText)

        cy.login("alice", "alice")
        cy.visit("/")
        cy.get("#post-list-container")
          .children()
          .first()
          .should("contain", postText)
          .within($=> {
            cy.get('[id*="post-delete"]').should("not.exist")
          })
      })

      context("should be able to edit a post", () => {
        beforeEach(() => {
          cy.login('joe', 'joe')
          cy.visit("/")
          cy.get("#content").type("my first editable post")
          cy.get('#new-post-form').submit();
          cy.get("#post-list-container")
            .children()
            .first()
            .should("contain", "my first editable post")
            .as("post");
        });

        it("should be able to edit a post", () => {
          cy.get('@post').within(($) => {
            cy.get("textarea").should("not.be.visible");
            cy.get('[id*="post-edit-button"]').click();
            cy.get("textarea").should("be.visible").clear().type("can edit a post");
            cy.get('[type="submit"]').click();
            // the post content should update to the new value
            cy.get('[id$="-content"]')
              .should("be.visible")
              .and("have.text", "can edit a post");
          });
        });

        it("should not be able to update to an empty post", () => {
          cy.get('@post').within($=> {
            cy.get('[id*="post-edit-button"]').click();
            cy.get("textarea").type("{enter}")
            cy.get('[id$="-content"]')
              .should("not.be.visible")
              .and("not.contain", /^$/)

            cy.get("textarea").clear().type("     \n    \n   ")
            cy.get('[type="submit"]').click()
            cy.get('[id$="-content"]')
              .should("not.be.visible")
              .invoke('text')
              .should("not.match", /^[\s\n]*$/)
          })
        })
      });

      it("should not be able to edit another users posts", () => {
        cy.get("#content").type("my first post")
        cy.get('#new-post-form').submit();
        cy.get("#post-list-container")
          .children()
          .first()
          .contains("my first post");
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
            const toFollow =
              $btn.attr("data-followed-status") == "true" ? true : false;
            const countAfter = parseInt($count.text());
            expect(countAfter).to.equal(
              toFollow ? countBefore + 1 : countBefore - 1
            );
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
  });
});
