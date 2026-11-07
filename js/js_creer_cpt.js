// ======================================================
// TOYCYCLE - CRÉATION DE COMPTE
// ======================================================

const togglePassword = document.querySelector(".toggle-password");
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

const registerForm = document.getElementById("registerForm");

// ======================================================
// INSCRIPTION
// ======================================================

registerForm.addEventListener("submit", async function (event) {   // ← "async" ajouté ici

    event.preventDefault();

    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const email = document.getElementById("email").value.trim();
    const ville = document.getElementById("ville").value;
    const telephone = document.getElementById("telephone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const conditions = document.getElementById("conditions").checked;

    if (!conditions) {
        alert("Vous devez accepter les conditions d'utilisation.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    const telephoneRegex = /^0[5-7][0-9]{8}$/;
    if (!telephoneRegex.test(telephone)) {
        alert("Veuillez saisir un numéro de téléphone valide.");
        return;
    }

    try {
        const response = await fetch("php/inscription.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nom: nom,
                prenom: prenom,
                email: email,
                ville: ville,
                telephone: telephone,
                password: password,
                confirmPassword: confirmPassword,
                conditions: conditions
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert(data.message);
        window.location.href = "se_connecter.html";

    } catch (error) {
        console.error("Erreur :", error);
        alert("Impossible de communiquer avec le serveur.");
    }
});