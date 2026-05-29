import { db, connectDB } from "./src/config/db.js";

async function run() {
  await connectDB();
  try {
    console.log("Starting cleanup...");

    const [animalsToDelRows] = await db.query(
      `SELECT Id FROM animal 
       WHERE Id IN (SELECT IdAnimal FROM possession WHERE IdRefuge IN (1, 2))
          OR Id NOT IN (SELECT IdAnimal FROM possession WHERE IdRefuge IS NOT NULL)`
    );
    const animalIds = animalsToDelRows.map(r => r.Id);
    
    if (animalIds.length > 0) {
      console.log(`Cleaning up ${animalIds.length} animals...`);
      await db.query(`DELETE FROM annonce WHERE IdAnimal IN (?)`, [animalIds]).catch(e => console.log('Annonce:', e.message));
      await db.query(`DELETE FROM demande_adoption WHERE IdAnimal IN (?)`, [animalIds]).catch(e => console.log('Adoption:', e.message));
      await db.query(`DELETE FROM demande_transfert WHERE IdAnimal IN (?)`, [animalIds]).catch(e => console.log('Transfert:', e.message));
      await db.query(`DELETE FROM photo WHERE IdAnimal IN (?)`, [animalIds]).catch(e => console.log('Photo:', e.message));
      await db.query(`DELETE FROM possession WHERE IdAnimal IN (?)`, [animalIds]).catch(e => console.log('Possession:', e.message));
      await db.query(`DELETE FROM vaccin_animal WHERE IdAnimal IN (?)`, [animalIds]).catch(e => console.log('Vaccin:', e.message));
      await db.query(`DELETE FROM caracteristique WHERE IdAnimal IN (?)`, [animalIds]).catch(e => console.log('Caracteristique:', e.message));
      
      const [resAnim] = await db.query(`DELETE FROM animal WHERE Id IN (?)`, [animalIds]);
      console.log(`Deleted ${resAnim.affectedRows} animals.`);
    } else {
        console.log("No animals to delete.");
    }

    const [productsToDelRows] = await db.query(
      `SELECT Id FROM produit WHERE IdRefuge IN (1, 2) OR IdRefuge IS NULL`
    );
    const productIds = productsToDelRows.map(r => r.Id);

    if (productIds.length > 0) {
      console.log(`Cleaning up ${productIds.length} products...`);
      await db.query(`DELETE FROM ligne_panier WHERE IdProduit IN (?)`, [productIds]).catch(e => console.log('Panier:', e.message));
      await db.query(`DELETE FROM ligne_commande WHERE IdProduit IN (?)`, [productIds]).catch(e => console.log('Commande:', e.message));
      await db.query(`DELETE FROM ligne_wishlist WHERE IdProduit IN (?)`, [productIds]).catch(e => console.log('Wishlist:', e.message));
      await db.query(`DELETE FROM avis WHERE IdProduit IN (?)`, [productIds]).catch(e => console.log('Avis:', e.message));
      await db.query(`DELETE FROM photo WHERE IdProduit IN (?)`, [productIds]).catch(e => console.log('Photo Prod:', e.message));
      await db.query(`DELETE FROM materiaux_produit WHERE IdProduit IN (?)`, [productIds]).catch(e => console.log('Materiaux:', e.message));
      
      const [resProd] = await db.query(`DELETE FROM produit WHERE Id IN (?)`, [productIds]);
      console.log(`Deleted ${resProd.affectedRows} products.`);
    } else {
        console.log("No products to delete.");
    }

    console.log("Cleanup complete!");

  } catch (err) {
    console.error("Error during cleanup:", err);
  }
  process.exit(0);
}
run();
