document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const togglePassword = document.querySelector(".toggle-password");

    if (!form) {
        console.error("Le formulaire loginForm est introuvable.");
        return;
    }

    // ========================================================
    // AFFICHER / CACHER LE MOT DE PASSE
    // ========================================================
    if (togglePassword) {
        togglePassword.addEventListener("click", function () {
            const targetId = togglePassword.dataset.target;
            const passwordInput = document.getElementById(targetId);

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.classList.remove("fa-eye");
                togglePassword.classList.add("fa-eye-slash");
            } else {
                passwordInput.type = "password";
                togglePassword.classList.remove("fa-eye-slash");
                togglePassword.classList.add("fa-eye");
            }
        });
    }

    // ========================================================
    // GESTION DES ERREURS D'AFFICHAGE
    // ========================================================
    function afficherErreur(element, message) {
        supprimerErreur(element);
        const erreur = document.createElement("div");
        erreur.classList.add("error");
        erreur.textContent = message;
        element.insertAdjacentElement("afterend", erreur);
    }

    function supprimerErreur(element) {
        const erreur = element.nextElementSibling;
        if (erreur && erreur.classList.contains("error")) {
            erreur.remove();
        }
    }

    function supprimerToutesLesErreurs() {
        document.querySelectorAll(".error").forEach(e => e.remove());
    }

    // ========================================================
    // VALIDATION EMAIL / MOT DE PASSE (côté client)
    // ========================================================
    function validerEmail() {
        const valeur = email.value.trim();
        if (valeur === "") {
            afficherErreur(email, "Veuillez saisir votre adresse email.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valeur)) {
            afficherErreur(email, "Veuillez saisir une adresse email valide.");
            return false;
        }
        supprimerErreur(email);
        return true;
    }

    function validerPassword() {
        const valeur = password.value;
        if (valeur === "") {
            afficherErreur(password, "Veuillez saisir votre mot de passe.");
            return false;
        }
        supprimerErreur(password);
        return true;
    }

    email.addEventListener("input", () => supprimerErreur(email));
    password.addEventListener("input", () => supprimerErreur(password));

    // ========================================================
    // SOUMISSION DU FORMULAIRE → PHP → MYSQL
    // ========================================================
    form.addEventListener("submit", async function (event) {

        event.preventDefault();
        supprimerToutesLesErreurs();

        const emailOK = validerEmail();
        const passwordOK = validerPassword();

        if (!emailOK || !passwordOK) {
            const premiereErreur = document.querySelector(".error");
            if (premiereErreur) {
                premiereErreur.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        const bouton = form.querySelector("button[type='submit']");
        if (bouton) {
            bouton.disabled = true;
            bouton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connexion...';
        }

        try {
            const response = await fetch("php/connexion_utilisateur.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value
                })
            });

            const data = await response.json();

            if (!data.success) {
                afficherErreur(password, data.message || "Email ou mot de passe incorrect.");
                return;
            }

            // Enregistrer l'utilisateur connecté (facultatif si tu utilises les sessions PHP)
            localStorage.setItem("utilisateurConnecte", JSON.stringify(data.utilisateur));

            alert(data.message || "Connexion réussie !");
            window.location.href = "profil.html";

        } catch (error) {
            console.error("Erreur connexion :", error);
            alert("Impossible de communiquer avec le serveur.");
        } finally {
            if (bouton) {
                bouton.disabled = false;
                bouton.innerHTML = "Se connecter";
            }
        }
    });

    console.log("ToyCycle : js_connecter.js chargé avec succès.");
});