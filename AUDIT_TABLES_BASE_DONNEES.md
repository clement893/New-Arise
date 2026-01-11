# 🔍 Audit des Tables de Base de Données

**Date:** 2025-01-26  
**Projet:** ARISE  
**Statut:** ✅ Audit Complet Effectué

---

## 📊 Vue d'Ensemble

La base de données PostgreSQL contient **66 tables** au total, organisées en plusieurs catégories :
- **Tables ARISE** (nécessaires pour le fonctionnement)
- **Tables Template** (potentiellement non utilisées)
- **Tables Partagées** (utilisées par ARISE et Template)

---

## ✅ Tables ARISE (Nécessaires)

### Authentification & RBAC
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `users` | Utilisateurs | ✅ Core ARISE |
| `roles` | Rôles | ✅ RBAC ARISE |
| `permissions` | Permissions | ✅ RBAC ARISE |
| `role_permissions` | Lien rôles-permissions | ✅ RBAC ARISE |
| `user_roles` | Lien utilisateurs-rôles | ✅ RBAC ARISE |
| `user_permissions` | Permissions directes utilisateurs | ✅ RBAC ARISE |

### Gestion d'Équipes
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `teams` | Équipes/Organisations | ✅ ARISE |
| `team_members` | Membres d'équipe | ✅ ARISE |
| `invitations` | Invitations d'équipe | ✅ ARISE |

### Assessments ARISE
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `assessments` | Assessments (TKI, Wellness, 360°, MBTI) | ✅ Core ARISE |
| `assessment_answers` | Réponses aux assessments | ✅ Core ARISE |
| `assessment_results` | Résultats des assessments | ✅ Core ARISE |
| `assessment_360_evaluators` | Évaluateurs 360° | ✅ Core ARISE |
| `assessment_questions` | Questions des assessments | ✅ Core ARISE |

### Réseau ARISE
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `companies` | Entreprises | ✅ Réseau ARISE |
| `contacts` | Contacts | ✅ Réseau ARISE |

### Coaching ARISE
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `coaching_sessions` | Sessions de coaching | ✅ Coaching ARISE |
| `coaching_packages` | Packages de coaching | ✅ Coaching ARISE |

### Facturation & Abonnements
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `plans` | Plans d'abonnement | ✅ Facturation ARISE |
| `subscriptions` | Abonnements utilisateurs | ✅ Facturation ARISE |
| `invoices` | Factures | ✅ Facturation ARISE |

### Blog & CMS
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `posts` | Articles de blog | ✅ Blog ARISE |
| `pages` | Pages statiques | ✅ CMS ARISE |
| `tags` | Tags | ✅ Blog/CMS ARISE |
| `categories` | Catégories | ✅ Blog/CMS ARISE |
| `entity_tags` | Tags d'entités | ✅ Blog/CMS ARISE |

### Thèmes & Personnalisation
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `themes` | Configurations de thème | ✅ Thèmes ARISE |
| `theme_fonts` | Polices de thème | ✅ Thèmes ARISE |
| `user_preferences` | Préférences utilisateur | ✅ ARISE |

### Autres Tables ARISE
| Table | Description | Utilisation |
|-------|-------------|-------------|
| `files` | Fichiers | ✅ ARISE |
| `notifications` | Notifications | ✅ ARISE |

**Total Tables ARISE: 30 tables**

---

## ⚠️ Tables Template (Potentiellement Non Utilisées)

### Gestion de Projets Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `projects` | Projets utilisateur | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Formulaires Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `forms` | Formulaires dynamiques | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `form_submissions` | Soumissions de formulaires | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Onboarding Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `onboarding_steps` | Étapes d'onboarding | ❌ Pages supprimées | 🔴 **À SUPPRIMER** |
| `user_onboarding` | Progression onboarding | ❌ Pages supprimées | 🔴 **À SUPPRIMER** |

### Support Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `support_tickets` | Tickets de support | ⚠️ Help center (pages supprimées) | 🟡 **À VÉRIFIER** |
| `ticket_messages` | Messages de tickets | ⚠️ Help center (pages supprimées) | 🟡 **À VÉRIFIER** |

### Annonces Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `announcements` | Annonces | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `announcement_dismissals` | Dismissals d'annonces | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Feature Flags Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `feature_flags` | Feature flags | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `feature_flag_logs` | Logs de feature flags | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Tâches Programmées Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `scheduled_tasks` | Tâches programmées | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `task_execution_logs` | Logs d'exécution | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Backups Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `backups` | Backups | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `restore_operations` | Opérations de restauration | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Documentation Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `documentation_articles` | Articles de documentation | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `documentation_categories` | Catégories de documentation | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `documentation_feedback` | Feedback documentation | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Partage & Collaboration Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `shares` | Partages | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `share_access_logs` | Logs d'accès partages | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `favorites` | Favoris | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `comments` | Commentaires | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `comment_reactions` | Réactions aux commentaires | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `feedback` | Feedback | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `feedback_attachments` | Pièces jointes feedback | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Rapports & Versions Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `reports` | Rapports | ❌ Non utilisé | 🔴 **À SUPPRIMER** |
| `versions` | Versions | ❌ Non utilisé | 🔴 **À SUPPRIMER** |

### Menus Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `menus` | Menus | ⚠️ Peut être utilisé pour CMS | 🟡 **À VÉRIFIER** |

### Templates Template
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `templates` | Templates de contenu | ⚠️ Peut être utilisé pour CMS | 🟡 **À VÉRIFIER** |
| `template_variables` | Variables de templates | ⚠️ Peut être utilisé pour CMS | 🟡 **À VÉRIFIER** |

**Total Tables Template: 28 tables**

---

## 🟡 Tables Partagées (À Vérifier)

### Intégrations
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `integrations` | Intégrations tierces | ⚠️ Peut être utilisé | 🟡 **À VÉRIFIER** |

### Webhooks
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `webhook_events` | Événements webhook | ⚠️ Peut être utilisé | 🟡 **À VÉRIFIER** |

### API Keys
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `api_keys` | Clés API | ⚠️ Peut être utilisé | 🟡 **À VÉRIFIER** |

### Email Templates
| Table | Description | Utilisation ARISE | Recommandation |
|-------|-------------|-------------------|----------------|
| `email_templates` | Templates d'email | ⚠️ Peut être utilisé | 🟡 **À VÉRIFIER** |
| `email_template_versions` | Versions de templates | ⚠️ Peut être utilisé | 🟡 **À VÉRIFIER** |

**Total Tables Partagées: 5 tables**

---

## 📋 Résumé des Recommandations

### 🔴 Tables à Supprimer (22 tables)
1. `projects`
2. `forms`, `form_submissions`
3. `onboarding_steps`, `user_onboarding`
4. `announcements`, `announcement_dismissals`
5. `feature_flags`, `feature_flag_logs`
6. `scheduled_tasks`, `task_execution_logs`
7. `backups`, `restore_operations`
8. `documentation_articles`, `documentation_categories`, `documentation_feedback`
9. `shares`, `share_access_logs`
10. `favorites`
11. `comments`, `comment_reactions`
12. `feedback`, `feedback_attachments`
13. `reports`
14. `versions`

### 🟡 Tables à Vérifier (7 tables)
1. `support_tickets`, `ticket_messages` - Help center (pages supprimées mais fonctionnalité peut être utilisée)
2. `menus` - Peut être utilisé pour CMS
3. `templates`, `template_variables` - Peut être utilisé pour CMS
4. `integrations` - Peut être utilisé pour intégrations tierces
5. `webhook_events` - Peut être utilisé pour webhooks
6. `api_keys` - Peut être utilisé pour API keys
7. `email_templates`, `email_template_versions` - Peut être utilisé pour emails

### ✅ Tables à Conserver (30 tables)
Toutes les tables ARISE listées ci-dessus.

---

## 🔧 Plan d'Action

### Phase 1: Vérification des Tables Partagées
1. Vérifier l'utilisation de `support_tickets` dans le code
2. Vérifier l'utilisation de `menus` pour le CMS
3. Vérifier l'utilisation de `templates` pour le CMS
4. Vérifier l'utilisation de `integrations`, `webhook_events`, `api_keys`
5. Vérifier l'utilisation de `email_templates`

### Phase 2: Suppression des Tables Template
1. Créer des migrations pour supprimer les tables identifiées
2. Vérifier les dépendances (foreign keys)
3. Supprimer les modèles SQLAlchemy correspondants
4. Nettoyer les imports dans le code

### Phase 3: Nettoyage
1. Supprimer les endpoints API non utilisés
2. Supprimer les schémas Pydantic non utilisés
3. Mettre à jour la documentation

---

## 📊 Statistiques

- **Total Tables:** 66 tables
- **Tables ARISE:** 30 tables (45%)
- **Tables Template:** 28 tables (42%)
- **Tables Partagées:** 5 tables (8%)
- **Tables à Supprimer:** 22 tables (33%)
- **Tables à Vérifier:** 7 tables (11%)

---

## ⚠️ Avertissements

1. **Foreign Keys:** Avant de supprimer une table, vérifier toutes les dépendances
2. **Données Existantes:** Sauvegarder les données avant suppression
3. **Migrations:** Créer des migrations réversibles
4. **Tests:** Mettre à jour les tests après suppression

---

**Date de création:** 2025-01-26  
**Dernière mise à jour:** 2025-01-26
