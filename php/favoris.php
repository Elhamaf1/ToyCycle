<?php

// ============================================================
// TOYCYCLE - FAVORIS (GET / POST / DELETE)
// ============================================================

header("Content-Type: application/json; charset=UTF-8");

session_start();
require_once "connexion.php";

// L'utilisateur doit être connecté
if (!isset($_SESSION["id_utilisateur"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Utilisateur non connecté."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$id_utilisateur = (int)$_SESSION["id_utilisateur"];
$methode = $_SERVER["REQUEST_METHOD"];

try {

    // ========================================================
    // GET -> liste des id_annonce favoris de l'utilisateur
    // ========================================================
    if ($methode === "GET") {

        $sql = "
            SELECT id_annonce
            FROM favori
            WHERE id_utilisateur = :id_utilisateur
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([":id_utilisateur" => $id_utilisateur]);

        $favoris = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $favoris = array_map("intval", $favoris);

        echo json_encode([
            "success" => true,
            "favoris" => $favoris
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ========================================================
    // POST -> ajouter un favori
    // body JSON attendu : { "id_annonce": 5 }
    // ========================================================
    if ($methode === "POST") {

        $data = json_decode(file_get_contents("php://input"), true);
        $id_annonce = isset($data["id_annonce"]) ? (int)$data["id_annonce"] : 0;

        if ($id_annonce <= 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "id_annonce invalide."
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $sql = "
            INSERT IGNORE INTO favori (id_utilisateur, id_annonce)
            VALUES (:id_utilisateur, :id_annonce)
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ":id_utilisateur" => $id_utilisateur,
            ":id_annonce" => $id_annonce
        ]);

        // Mettre à jour le compteur uniquement si un nouveau favori a été inséré
        if ($stmt->rowCount() > 0) {

            $pdo->prepare("
                UPDATE annonce
                SET nombre_favoris = nombre_favoris + 1
                WHERE id_annonce = :id_annonce
            ")->execute([":id_annonce" => $id_annonce]);
        }

        echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ========================================================
    // DELETE -> retirer un favori
    // query attendue : favoris.php?id_annonce=5
    // ========================================================
    if ($methode === "DELETE") {

        $id_annonce = isset($_GET["id_annonce"]) ? (int)$_GET["id_annonce"] : 0;

        if ($id_annonce <= 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "id_annonce invalide."
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $sql = "
            DELETE FROM favori
            WHERE id_utilisateur = :id_utilisateur
              AND id_annonce = :id_annonce
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ":id_utilisateur" => $id_utilisateur,
            ":id_annonce" => $id_annonce
        ]);

        // Mettre à jour le compteur uniquement si une ligne a été supprimée
        if ($stmt->rowCount() > 0) {

            $pdo->prepare("
                UPDATE annonce
                SET nombre_favoris = GREATEST(nombre_favoris - 1, 0)
                WHERE id_annonce = :id_annonce
            ")->execute([":id_annonce" => $id_annonce]);
        }

        echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur lors de la gestion des favoris."
    ], JSON_UNESCAPED_UNICODE);
}