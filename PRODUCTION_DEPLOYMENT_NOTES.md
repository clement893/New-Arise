# 🚀 Notes de Déploiement Production - Page de Test API Connections

## ✅ Changements Poussés

Les changements suivants ont été poussés en production :

1. **Page de test** : `/test/api-connections`
2. **Endpoints backend** : `/api/v1/api-connection-check/*`
3. **Scripts Node.js** : `scripts/check-api-connections.js`, etc.
4. **Dockerfile mis à jour** : Inclut Node.js pour exécuter les scripts

## 📋 Configuration Requise

### Backend Dockerfile

Le Dockerfile du backend a été mis à jour pour :
- ✅ Installer Node.js 18.x
- ✅ Rechercher les scripts à différents emplacements

### Scripts Node.js

Les scripts doivent être disponibles dans le conteneur backend. Selon votre méthode de déploiement :

#### Option 1 : Railway (Recommandé)

Railway utilise généralement le contexte de build à la racine du projet. Les scripts seront automatiquement disponibles si :
- Le Dockerfile backend copie depuis le contexte racine
- Les scripts sont dans `scripts/` à la racine

#### Option 2 : Docker Compose

Si vous utilisez Docker Compose, assurez-vous que :
```yaml
backend:
  build:
    context: .  # Contexte à la racine
    dockerfile: backend/Dockerfile
```

#### Option 3 : Build Manuel

Si vous build manuellement :
```bash
# Depuis la racine du projet
docker build -f backend/Dockerfile -t backend .
# Les scripts seront copiés automatiquement
```

## 🔧 Vérification en Production

### 1. Vérifier que Node.js est installé

Dans le conteneur backend :
```bash
node --version
# Devrait afficher: v18.x.x ou supérieur
```

### 2. Vérifier que les scripts sont disponibles

Dans le conteneur backend :
```bash
ls -la /app/scripts/
# Devrait afficher les fichiers .js
```

Si les scripts ne sont pas trouvés, vérifiez :
- Le contexte de build Docker
- Les chemins dans le Dockerfile
- Les logs de build

### 3. Tester l'endpoint

```bash
curl -X GET "https://your-api.com/api/v1/api-connection-check/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Tester la page

Ouvrir dans le navigateur :
```
https://your-domain.com/test/api-connections
```

## 🐛 Dépannage

### Erreur : "Script not found"

**Cause** : Les scripts ne sont pas copiés dans le conteneur

**Solution** :
1. Vérifier le contexte de build Docker
2. S'assurer que `scripts/` est à la racine du projet
3. Vérifier les logs de build pour voir ce qui est copié

### Erreur : "Node.js is not installed"

**Cause** : Node.js n'est pas installé dans le conteneur

**Solution** :
1. Vérifier que le Dockerfile inclut l'installation de Node.js
2. Rebuild l'image Docker
3. Vérifier les logs de build

### Erreur : "Permission denied"

**Cause** : Permissions insuffisantes pour exécuter les scripts

**Solution** :
1. Vérifier les permissions des fichiers scripts
2. S'assurer que l'utilisateur du conteneur peut exécuter Node.js

## 📝 Notes Importantes

1. **Sécurité** : Les endpoints nécessitent admin/superadmin
2. **Performance** : Les scripts peuvent prendre jusqu'à 60 secondes
3. **Timeout** : Timeout de 60 secondes pour l'exécution des scripts
4. **Chemins** : Le code cherche les scripts à plusieurs emplacements pour compatibilité

## 🔄 Mise à Jour

Si vous modifiez les scripts :
1. Pousser les changements
2. Rebuild l'image Docker
3. Redéployer

Les scripts sont exécutés à la demande, donc pas besoin de redémarrer le backend après modification des scripts (si les fichiers sont montés en volume en dev).

---

*Document créé le: [Date]*
*Dernière mise à jour: [Date]*

