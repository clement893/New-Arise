# API Endpoints Audit Report

Generated: 2025-12-28T18:13:21.440Z  
Last Updated: 2025-01-28

---

## 📋 Corrections Appliquées

### Endpoints Créés (9 nouveaux endpoints)

1. **User Preferences:**
   - GET `/v1/users/preferences/notifications`
   - PUT `/v1/users/preferences/notifications`

2. **Admin/Tenancy:**
   - GET `/v1/admin/tenancy/config`
   - PUT `/v1/admin/tenancy/config`

3. **Media:**
   - POST `/v1/media/validate`

4. **Tags:**
   - GET `/v1/tags/` (list)
   - PUT `/v1/tags/{id}` (update)
   - DELETE `/v1/tags/{id}` (delete)

5. **Scheduled Tasks:**
   - PUT `/v1/scheduled-tasks/{task_id}/toggle`

6. **Pages:**
   - DELETE `/v1/pages/id/{page_id}` (delete by ID)

### Corrections de Chemins (15 fichiers)

- Suppression des préfixes dupliqués dans les chemins API
- Exemples: `/api/v1/announcements/announcements` → `/v1/announcements`

### Conversions fetch() → apiClient (5 appels)

- `AdminSettingsContent.tsx` - PUT `/v1/users/me`
- `UploadContent.tsx` - POST `/v1/media/validate`
- Exemples dans `docs/page.tsx` - Commentés (code d'exemple)
- `rateLimiter.ts` - Commentés (exemples dans commentaires)

### Vérifications Effectuées

- ✅ Tous les endpoints d'authentification vérifiés (Batch 5)
- ✅ Tous les endpoints RBAC vérifiés (Batch 7)
- ✅ Tous les endpoints DELETE vérifiés (Batch 6)

---

## 📊 Summary

- **Backend Endpoints**: 277
- **Frontend fetch() calls**: 15
- **Frontend apiClient calls**: 170
- **fetch() calls that should use apiClient**: 5
- **apiClient calls without endpoints**: 144

## 🔧 Backend Endpoints by Method

- **GET**: 132
- **POST**: 71
- **DELETE**: 38
- **PUT**: 35
- **PATCH**: 1

## 📁 Backend Endpoints by File

- **rbac.py**: 19 endpoints
- **tags.py**: 15 endpoints
- **forms.py**: 10 endpoints
- **scheduled_tasks.py**: 8 endpoints
- **user_preferences.py**: 8 endpoints
- **auth.py**: 7 endpoints
- **documentation.py**: 7 endpoints
- **email_templates.py**: 7 endpoints
- **feature_flags.py**: 7 endpoints
- **shares.py**: 7 endpoints
- **subscriptions.py**: 7 endpoints
- **teams.py**: 7 endpoints
- **templates.py**: 7 endpoints
- **comments.py**: 6 endpoints
- **favorites.py**: 6 endpoints
- **feedback.py**: 6 endpoints
- **health.py**: 6 endpoints
- **integrations.py**: 6 endpoints
- **onboarding.py**: 6 endpoints
- **pages.py**: 6 endpoints
- **reports.py**: 6 endpoints
- **support_tickets.py**: 6 endpoints
- **themes.py**: 6 endpoints
- **versions.py**: 6 endpoints
- **announcements.py**: 5 endpoints
- **backups.py**: 5 endpoints
- **invitations.py**: 5 endpoints
- **media.py**: 5 endpoints
- **menus.py**: 5 endpoints
- **posts.py**: 5 endpoints
- **projects.py**: 5 endpoints
- **api_connection_check.py**: 4 endpoints
- **api_keys.py**: 4 endpoints
- **two_factor.py**: 4 endpoints
- **users.py**: 4 endpoints
- **client\tickets.py**: 3 endpoints
- **newsletter.py**: 3 endpoints
- **activities.py**: 2 endpoints
- **api_settings.py**: 2 endpoints
- **audit_trail.py**: 2 endpoints
- **client\invoices.py**: 2 endpoints
- **client\orders.py**: 2 endpoints
- **client\projects.py**: 2 endpoints
- **erp\clients.py**: 2 endpoints
- **erp\inventory.py**: 2 endpoints
- **erp\invoices.py**: 2 endpoints
- **erp\orders.py**: 2 endpoints
- **exports.py**: 2 endpoints
- **imports.py**: 2 endpoints
- **organization_settings.py**: 2 endpoints
- **search.py**: 2 endpoints
- **seo.py**: 2 endpoints
- **theme_fonts.py**: 2 endpoints
- **analytics.py**: 1 endpoints
- **client\dashboard.py**: 1 endpoints
- **db_health.py**: 1 endpoints
- **erp\dashboard.py**: 1 endpoints
- **erp\reports.py**: 1 endpoints
- **insights.py**: 1 endpoints

## 📡 All Backend Endpoints

| Method | Path | Function | File | Tag |
|--------|------|----------|------|-----|
| DELETE | `/{font_id}` | delete_font | theme_fonts.py | theme-fonts |
| DELETE | `/{integration_id}` | delete_integration | integrations.py | integrations |
| DELETE | `/{key_id}` | revoke_api_key | api_keys.py | - |
| DELETE | `/{project_id}` | delete_project | projects.py | - |
| DELETE | `/{theme_id}` | delete_theme | themes.py | themes |
| DELETE | `/{user_id}` | delete_user | users.py | - |
| DELETE | `/announcements/{announcement_id}` | delete_announcement | announcements.py | announcements |
| DELETE | `/backups/{backup_id}` | delete_backup | backups.py | backups |
| DELETE | `/categories/{category_id}` | delete_category | tags.py | categories |
| DELETE | `/comments/{comment_id}` | delete_comment | comments.py | comments |
| DELETE | `/comments/{comment_id}/reactions` | remove_reaction | comments.py | comments |
| DELETE | `/documentation/articles/{article_id}` | delete_article | documentation.py | documentation |
| DELETE | `/email-templates/{template_id}` | delete_template | email_templates.py | email-templates |
| DELETE | `/favorites/{entity_type}/{entity_id}` | remove_favorite | favorites.py | favorites |
| DELETE | `/feature-flags/{flag_id}` | delete_feature_flag | feature_flags.py | feature-flags |
| DELETE | `/feedback/{feedback_id}` | delete_feedback | feedback.py | feedback |
| DELETE | `/forms/{form_id}` | delete_form | forms.py | forms |
| DELETE | `/forms/submissions/{submission_id}` | delete_submission | forms.py | forms |
| DELETE | `/invitations/{invitation_id}` | cancel_invitation | invitations.py | - |
| DELETE | `/media/{media_id}` | delete_media | media.py | media |
| DELETE | `/menus/{menu_id}` | delete_menu | menus.py | menus |
| DELETE | `/pages/{slug}` | delete_page | pages.py | pages |
| DELETE | `/pages/id/{page_id}` | delete_page_by_id | pages.py | pages |
| DELETE | `/posts/{post_id}` | delete_post | posts.py | posts |
| DELETE | `/preferences` | delete_all_preferences | user_preferences.py | user-preferences |
| DELETE | `/preferences/{key}` | delete_preference | user_preferences.py | user-preferences |
| DELETE | `/rbac/roles/{role_id}` | delete_role | rbac.py | - |
| DELETE | `/rbac/roles/{role_id}/permissions/{permission_id}` | remove_permission_from_role | rbac.py | - |
| DELETE | `/rbac/users/{user_id}/permissions/custom/{permission_id}` | remove_custom_permission | rbac.py | - |
| DELETE | `/rbac/users/{user_id}/roles/{role_id}` | remove_role_from_user | rbac.py | - |
| DELETE | `/reports/{report_id}` | delete_report | reports.py | reports |
| DELETE | `/scheduled-tasks/{task_id}` | delete_task | scheduled_tasks.py | scheduled-tasks |
| DELETE | `/shares/{share_id}` | delete_share | shares.py | shares |
| DELETE | `/tags/{tag_id}` | delete_tag | tags.py | tags |
| DELETE | `/tags/{tag_id}/entities/{entity_type}/{entity_id}` | remove_tag_from_entity | tags.py | tags |
| DELETE | `/teams/{team_id}` | delete_team | teams.py | - |
| DELETE | `/teams/{team_id}/members/{user_id}` | remove_team_member | teams.py | - |
| DELETE | `/templates/{template_id}` | delete_template | templates.py | templates |
| GET | `/` | get_api_settings | api_settings.py | api-settings |
| GET | `/` | database_health_check | db_health.py | - |
| GET | `/` | health_check | health.py | - |
| GET | `/` | list_integrations | integrations.py | integrations |
| GET | `/` | get_organization_settings | organization_settings.py | organization-settings |
| GET | `/` | get_projects | projects.py | - |
| GET | `/` | list_users | users.py | users |
| GET | `/{font_id}` | get_font | theme_fonts.py | theme-fonts |
| GET | `/{integration_id}` | get_integration | integrations.py | integrations |
| GET | `/{project_id}` | get_project | projects.py | - |
| GET | `/{theme_id}` | get_theme | themes.py | themes |
| GET | `/{user_id}` | get_user | users.py | users |
| GET | `/active` | get_active_theme | themes.py | themes |
| GET | `/activities` | get_activities | activities.py | activities |
| GET | `/activities/timeline` | get_activity_timeline | activities.py | activities |
| GET | `/analytics/metrics` | get_analytics_metrics | analytics.py | analytics |
| GET | `/announcements` | get_announcements | announcements.py | announcements |
| GET | `/api-connection-check/backend` | check_backend_endpoints | api_connection_check.py | - |
| GET | `/api-connection-check/frontend` | check_frontend_connections | api_connection_check.py | - |
| GET | `/api-connection-check/report` | generate_report | api_connection_check.py | - |
| GET | `/api-connection-check/status` | get_connection_status | api_connection_check.py | - |
| GET | `/audit-trail` | get_audit_trail | audit_trail.py | audit-trail |
| GET | `/audit-trail/stats` | get_audit_stats | audit_trail.py | audit-trail |
| GET | `/backups` | get_backups | backups.py | backups |
| GET | `/backups/{backup_id}` | get_backup | backups.py | backups |
| GET | `/categories/{category_id}` | get_category | tags.py | categories |
| GET | `/categories/tree` | get_category_tree | tags.py | categories |
| GET | `/client/dashboard/stats` | get_client_dashboard_stats | client\dashboard.py | - |
| GET | `/client/invoices/` | get_client_invoices | client\invoices.py | - |
| GET | `/client/invoices/{invoice_id}` | get_client_invoice | client\invoices.py | - |
| GET | `/client/orders/` | get_client_orders | client\orders.py | - |
| GET | `/client/orders/{order_id}` | get_client_order | client\orders.py | - |
| GET | `/client/projects/` | get_client_projects | client\projects.py | - |
| GET | `/client/projects/{project_id}` | get_client_project | client\projects.py | - |
| GET | `/client/tickets/` | get_client_tickets | client\tickets.py | - |
| GET | `/client/tickets/{ticket_id}` | get_client_ticket | client\tickets.py | - |
| GET | `/comments/{entity_type}/{entity_id}` | get_comments | comments.py | comments |
| GET | `/detailed` | detailed_health_check | health.py | - |
| GET | `/documentation/articles` | get_articles | documentation.py | documentation |
| GET | `/documentation/articles/{slug}` | get_article | documentation.py | documentation |
| GET | `/documentation/categories` | get_categories | documentation.py | documentation |
| GET | `/email-templates` | get_templates | email_templates.py | email-templates |
| GET | `/email-templates/{key}` | get_template | email_templates.py | email-templates |
| GET | `/email-templates/{template_id}/versions` | get_template_versions | email_templates.py | email-templates |
| GET | `/erp/clients/` | get_erp_clients | erp\clients.py | - |
| GET | `/erp/clients/{client_id}` | get_erp_client | erp\clients.py | - |
| GET | `/erp/dashboard/stats` | get_erp_dashboard_stats | erp\dashboard.py | - |
| GET | `/erp/inventory/movements` | get_inventory_movements | erp\inventory.py | - |
| GET | `/erp/inventory/products` | get_inventory_products | erp\inventory.py | - |
| GET | `/erp/invoices/` | get_erp_invoices | erp\invoices.py | - |
| GET | `/erp/invoices/{invoice_id}` | get_erp_invoice | erp\invoices.py | - |
| GET | `/erp/orders/` | get_erp_orders | erp\orders.py | - |
| GET | `/erp/orders/{order_id}` | get_erp_order | erp\orders.py | - |
| GET | `/erp/reports/` | get_erp_reports | erp\reports.py | - |
| GET | `/favorites` | get_favorites | favorites.py | favorites |
| GET | `/favorites/check/{entity_type}/{entity_id}` | check_favorite | favorites.py | favorites |
| GET | `/favorites/count/{entity_type}/{entity_id}` | get_favorites_count | favorites.py | favorites |
| GET | `/feature-flags` | get_feature_flags | feature_flags.py | feature-flags |
| GET | `/feature-flags/{flag_id}/stats` | get_feature_flag_stats | feature_flags.py | feature-flags |
| GET | `/feature-flags/{key}` | get_feature_flag | feature_flags.py | feature-flags |
| GET | `/feature-flags/{key}/check` | check_feature_flag | feature_flags.py | feature-flags |
| GET | `/feedback` | get_feedback | feedback.py | feedback |
| GET | `/feedback/{feedback_id}` | get_feedback_item | feedback.py | feedback |
| GET | `/formats` | get_export_formats | exports.py | exports |
| GET | `/formats` | get_import_formats | imports.py | imports |
| GET | `/forms` | list_forms | forms.py | forms |
| GET | `/forms/{form_id}` | get_form | forms.py | forms |
| GET | `/forms/{form_id}/export` | export_form_results | forms.py | forms |
| GET | `/forms/{form_id}/statistics` | get_form_statistics | forms.py | forms |
| GET | `/forms/{form_id}/submissions` | list_submissions | forms.py | forms |
| GET | `/google` | get_google_auth_url | auth.py | - |
| GET | `/google/callback` | google_oauth_callback | auth.py | - |
| GET | `/health` | simple_health_check | health.py | - |
| GET | `/insights` | get_insights | insights.py | insights |
| GET | `/invitations/{invitation_id}` | get_invitation | invitations.py | - |
| GET | `/invitations/token/{token}` | get_invitation_by_token | invitations.py | - |
| GET | `/list` | list_api_keys | api_keys.py | - |
| GET | `/live` | liveness_check | health.py | - |
| GET | `/me` | get_current_user_info | auth.py | - |
| GET | `/media` | list_media | media.py | media |
| GET | `/media/{media_id}` | get_media | media.py | media |
| GET | `/menus` | list_menus | menus.py | menus |
| GET | `/menus/{menu_id}` | get_menu | menus.py | menus |
| GET | `/onboarding/next-step` | get_next_step | onboarding.py | onboarding |
| GET | `/onboarding/progress` | get_onboarding_progress | onboarding.py | onboarding |
| GET | `/onboarding/steps` | get_onboarding_steps | onboarding.py | onboarding |
| GET | `/pages` | list_pages | pages.py | pages |
| GET | `/pages/{slug}` | get_page | pages.py | pages |
| GET | `/posts` | list_posts | posts.py | posts |
| GET | `/posts/{slug}` | get_post_by_slug | posts.py | posts |
| GET | `/preferences` | get_all_preferences | user_preferences.py | user-preferences |
| GET | `/preferences/{key}` | get_preference | user_preferences.py | user-preferences |
| GET | `/preferences/notifications` | get_notification_preferences | user_preferences.py | user-preferences |
| GET | `/rbac/permissions` | list_permissions | rbac.py | - |
| GET | `/rbac/roles` | list_roles | rbac.py | - |
| GET | `/rbac/roles/{role_id}` | get_role | rbac.py | - |
| GET | `/rbac/users/{user_id}/permissions` | get_user_permissions | rbac.py | - |
| GET | `/rbac/users/{user_id}/permissions/custom` | get_user_custom_permissions | rbac.py | - |
| GET | `/rbac/users/{user_id}/roles` | get_user_roles | rbac.py | - |
| GET | `/ready` | readiness_check | health.py | - |
| GET | `/reports` | list_reports | reports.py | reports |
| GET | `/reports/{report_id}` | get_report | reports.py | reports |
| GET | `/scheduled-tasks` | get_tasks | scheduled_tasks.py | scheduled-tasks |
| GET | `/scheduled-tasks/{task_id}` | get_task | scheduled_tasks.py | scheduled-tasks |
| GET | `/scheduled-tasks/{task_id}/logs` | get_task_logs | scheduled_tasks.py | scheduled-tasks |
| GET | `/search/autocomplete` | autocomplete | search.py | search |
| GET | `/seo/settings` | get_seo_settings | seo.py | seo |
| GET | `/shares/check-permission` | check_permission | shares.py | shares |
| GET | `/shares/entity/{entity_type}/{entity_id}` | get_entity_shares | shares.py | shares |
| GET | `/shares/my` | get_my_shares | shares.py | shares |
| GET | `/shares/token/{share_token}` | get_share_by_token | shares.py | shares |
| GET | `/startup` | startup_check | health.py | - |
| GET | `/status/{email}` | get_subscription_status | newsletter.py | newsletter |
| GET | `/subscriptions/me` | get_my_subscription | subscriptions.py | - |
| GET | `/subscriptions/plans` | list_plans | subscriptions.py | - |
| GET | `/subscriptions/plans/{plan_id}` | get_plan | subscriptions.py | - |
| GET | `/support/tickets` | list_tickets | support_tickets.py | support |
| GET | `/support/tickets/{ticket_id}` | get_ticket | support_tickets.py | support |
| GET | `/support/tickets/{ticket_id}/messages` | get_ticket_messages | support_tickets.py | support |
| GET | `/tags` | list_tags | tags.py | tags |
| GET | `/tags/{tag_id}` | get_tag | tags.py | tags |
| GET | `/tags/entity/{entity_type}/{entity_id}` | get_entity_tags | tags.py | tags |
| GET | `/tags/popular` | get_popular_tags | tags.py | tags |
| GET | `/tags/search` | search_tags | tags.py | tags |
| GET | `/teams/{team_id}` | get_team | teams.py | - |
| GET | `/teams/{team_id}/members` | list_team_members | teams.py | - |
| GET | `/templates` | get_templates | templates.py | templates |
| GET | `/templates/{template_id}` | get_template | templates.py | templates |
| GET | `/versions/{entity_type}/{entity_id}` | get_versions | versions.py | versions |
| GET | `/versions/{entity_type}/{entity_id}/{version_number}` | get_version_by_number | versions.py | versions |
| GET | `/versions/{entity_type}/{entity_id}/compare` | compare_versions | versions.py | versions |
| GET | `/versions/{entity_type}/{entity_id}/current` | get_current_version | versions.py | versions |
| PATCH | `/{integration_id}/toggle` | toggle_integration | integrations.py | integrations |
| POST | `/` | create_integration | integrations.py | integrations |
| POST | `/` | create_project | projects.py | - |
| POST | `/{key_id}/rotate` | rotate_api_key | api_keys.py | - |
| POST | `/{theme_id}/activate` | activate_theme | themes.py | themes |
| POST | `/announcements` | create_announcement | announcements.py | announcements |
| POST | `/announcements/{announcement_id}/dismiss` | dismiss_announcement | announcements.py | announcements |
| POST | `/backups` | create_backup | backups.py | backups |
| POST | `/backups/{backup_id}/restore` | restore_backup | backups.py | backups |
| POST | `/categories` | create_category | tags.py | categories |
| POST | `/client/tickets/` | create_client_ticket | client\tickets.py | - |
| POST | `/comments` | create_comment | comments.py | comments |
| POST | `/comments/{comment_id}/reactions` | add_reaction | comments.py | comments |
| POST | `/disable` | disable_two_factor | two_factor.py | - |
| POST | `/documentation/articles` | create_article | documentation.py | documentation |
| POST | `/documentation/articles/{article_id}/feedback` | submit_feedback | documentation.py | documentation |
| POST | `/email-templates` | create_template | email_templates.py | email-templates |
| POST | `/email-templates/{key}/render` | render_template | email_templates.py | email-templates |
| POST | `/export` | export_data | exports.py | exports |
| POST | `/favorites` | add_favorite | favorites.py | favorites |
| POST | `/feature-flags` | create_feature_flag | feature_flags.py | feature-flags |
| POST | `/feedback` | create_feedback | feedback.py | feedback |
| POST | `/feedback/{feedback_id}/attachments` | upload_attachment | feedback.py | feedback |
| POST | `/forms` | create_form | forms.py | forms |
| POST | `/forms/{form_id}/submissions` | create_submission | forms.py | forms |
| POST | `/generate` | generate_api_key_endpoint | api_keys.py | - |
| POST | `/import` | import_data | imports.py | imports |
| POST | `/invitations/{invitation_id}/resend` | resend_invitation | invitations.py | - |
| POST | `/invitations/accept` | accept_invitation | invitations.py | - |
| POST | `/login` | login | auth.py | - |
| POST | `/logout` | logout | auth.py | - |
| POST | `/media` | upload_media | media.py | media |
| POST | `/media/validate` | validate_media | media.py | media |
| POST | `/menus` | create_menu | menus.py | menus |
| POST | `/onboarding/initialize` | initialize_onboarding | onboarding.py | onboarding |
| POST | `/onboarding/steps/{step_key}/complete` | complete_step | onboarding.py | onboarding |
| POST | `/onboarding/steps/{step_key}/skip` | skip_step | onboarding.py | onboarding |
| POST | `/pages` | create_page | pages.py | pages |
| POST | `/posts` | create_post | posts.py | posts |
| POST | `/rbac/check` | check_permission | rbac.py | - |
| POST | `/rbac/permissions` | create_permission | rbac.py | - |
| POST | `/rbac/roles` | create_role | rbac.py | - |
| POST | `/rbac/roles/{role_id}/permissions` | assign_permission_to_role | rbac.py | - |
| POST | `/rbac/users/{user_id}/permissions/custom` | add_custom_permission | rbac.py | - |
| POST | `/rbac/users/{user_id}/roles` | assign_role_to_user | rbac.py | - |
| POST | `/refresh` | refresh_token | auth.py | - |
| POST | `/register` | register | auth.py | - |
| POST | `/reports` | create_report | reports.py | reports |
| POST | `/reports/{report_id}/refresh` | refresh_report | reports.py | reports |
| POST | `/scheduled-tasks` | create_task | scheduled_tasks.py | scheduled-tasks |
| POST | `/scheduled-tasks/{task_id}/cancel` | cancel_task | scheduled_tasks.py | scheduled-tasks |
| POST | `/search` | search | search.py | search |
| POST | `/setup` | setup_two_factor | two_factor.py | - |
| POST | `/shares` | create_share | shares.py | shares |
| POST | `/subscribe` | subscribe_to_newsletter | newsletter.py | newsletter |
| POST | `/subscriptions/cancel` | cancel_subscription | subscriptions.py | - |
| POST | `/subscriptions/checkout` | create_checkout_session | subscriptions.py | - |
| POST | `/subscriptions/portal` | create_portal_session | subscriptions.py | - |
| POST | `/subscriptions/upgrade/{plan_id}` | upgrade_subscription | subscriptions.py | - |
| POST | `/support/tickets` | create_ticket | support_tickets.py | support |
| POST | `/support/tickets/{ticket_id}/messages` | add_ticket_message | support_tickets.py | support |
| POST | `/tags` | create_tag | tags.py | tags |
| POST | `/tags/{tag_id}/entities/{entity_type}/{entity_id}` | add_tag_to_entity | tags.py | tags |
| POST | `/teams/{team_id}/members` | add_team_member | teams.py | - |
| POST | `/templates` | create_template | templates.py | templates |
| POST | `/templates/{template_id}/duplicate` | duplicate_template | templates.py | templates |
| POST | `/templates/{template_id}/render` | render_template | templates.py | templates |
| POST | `/unsubscribe` | unsubscribe_from_newsletter | newsletter.py | newsletter |
| POST | `/verify` | verify_two_factor_setup | two_factor.py | - |
| POST | `/verify-login` | verify_two_factor_login | two_factor.py | - |
| POST | `/versions` | create_version | versions.py | versions |
| POST | `/versions/{version_id}/restore` | restore_version | versions.py | versions |
| PUT | `/` | update_api_settings | api_settings.py | api-settings |
| PUT | `/` | update_organization_settings | organization_settings.py | organization-settings |
| PUT | `/{integration_id}` | update_integration | integrations.py | integrations |
| PUT | `/{project_id}` | update_project | projects.py | - |
| PUT | `/{theme_id}` | update_theme | themes.py | themes |
| PUT | `/active/mode` | update_active_theme_mode | themes.py | themes |
| PUT | `/announcements/{announcement_id}` | update_announcement | announcements.py | announcements |
| PUT | `/categories/{category_id}` | update_category | tags.py | categories |
| PUT | `/comments/{comment_id}` | update_comment | comments.py | comments |
| PUT | `/content/schedule/{task_id}/toggle` | toggle_task | scheduled_tasks.py | scheduled-tasks |
| PUT | `/documentation/articles/{article_id}` | update_article | documentation.py | documentation |
| PUT | `/email-templates/{template_id}` | update_template | email_templates.py | email-templates |
| PUT | `/favorites/{favorite_id}` | update_favorite | favorites.py | favorites |
| PUT | `/feature-flags/{flag_id}` | update_feature_flag | feature_flags.py | feature-flags |
| PUT | `/feedback/{feedback_id}` | update_feedback | feedback.py | feedback |
| PUT | `/forms/{form_id}` | update_form | forms.py | forms |
| PUT | `/me` | update_current_user | users.py | - |
| PUT | `/menus/{menu_id}` | update_menu | menus.py | menus |
| PUT | `/pages/{slug}` | update_page | pages.py | pages |
| PUT | `/posts/{post_id}` | update_post | posts.py | posts |
| PUT | `/preferences` | set_preferences | user_preferences.py | user-preferences |
| PUT | `/preferences/{key}` | set_preference | user_preferences.py | user-preferences |
| PUT | `/preferences/notifications` | update_notification_preferences | user_preferences.py | user-preferences |
| PUT | `/rbac/roles/{role_id}` | update_role | rbac.py | - |
| PUT | `/rbac/roles/{role_id}/permissions` | update_role_permissions | rbac.py | - |
| PUT | `/rbac/users/{user_id}/roles` | update_user_roles | rbac.py | - |
| PUT | `/reports/{report_id}` | update_report | reports.py | reports |
| PUT | `/scheduled-tasks/{task_id}` | update_task | scheduled_tasks.py | scheduled-tasks |
| PUT | `/seo/settings` | update_seo_settings | seo.py | seo |
| PUT | `/shares/{share_id}` | update_share | shares.py | shares |
| PUT | `/support/tickets/{ticket_id}` | update_ticket | support_tickets.py | support |
| PUT | `/tags/{tag_id}` | update_tag | tags.py | tags |
| PUT | `/teams/{team_id}` | update_team | teams.py | - |
| PUT | `/teams/{team_id}/members/{user_id}` | update_team_member | teams.py | - |
| PUT | `/templates/{template_id}` | update_template | templates.py | templates |

## ⚠️ Issues: fetch() Calls That Should Use apiClient

| File | Line | Method | URL | Has Endpoint | Recommendation |
|------|------|--------|-----|--------------|----------------|
| app\admin\users\AdminUsersContent.tsx | 76 | DELETE | `/api/v1/users/${selectedUser.id}` | ❌ | No corresponding endpoint found - may be incorrect |
| app\docs\page.tsx | 156 | GET | `/api/v1/users` | ❌ | No corresponding endpoint found - may be incorrect |
| app\[locale]\docs\page.tsx | 156 | GET | `/api/v1/users` | ❌ | No corresponding endpoint found - may be incorrect |
| lib\utils\rateLimiter.ts | 12 | GET | `/api/users` | ❌ | No corresponding endpoint found - may be incorrect |
| lib\utils\rateLimiter.ts | 60 | GET | `/api/users` | ❌ | No corresponding endpoint found - may be incorrect |

## ⚠️ Issues: apiClient Calls Without Backend Endpoints

| File | Line | Method | URL | Recommendation |
|------|------|--------|-----|----------------|
| app\admin\settings\AdminSettingsContent.tsx | 30 | PUT | `/v1/users/me` | No corresponding backend endpoint found |
| app\admin\users\AdminUsersContent.tsx | 44 | GET | `/v1/users?page=1&page_size=100` | No corresponding backend endpoint found |
| app\[locale]\admin\statistics\AdminStatisticsContent.tsx | 32 | GET | `/v1/users?page=1&page_size=1` | No corresponding backend endpoint found |
| app\[locale]\admin\statistics\AdminStatisticsContent.tsx | 56 | GET | `/v1/audit-trail/audit-trail?limit=1&offset=0` | No corresponding backend endpoint found |
| app\[locale]\admin\tenancy\TenancyContent.tsx | 54 | GET | `/v1/admin/tenancy/config` | No corresponding backend endpoint found |
| app\[locale]\admin\tenancy\TenancyContent.tsx | 79 | PUT | `/v1/admin/tenancy/config` | No corresponding backend endpoint found |
| app\[locale]\admin\users\AdminUsersContent.tsx | 47 | GET | `/v1/users?page=1&page_size=100` | No corresponding backend endpoint found |
| app\[locale]\admin\users\AdminUsersContent.tsx | 80 | DELETE | `/v1/users/${selectedUser.id}` | No corresponding backend endpoint found |
| app\[locale]\content\categories\page.tsx | 43 | GET | `/v1/tags/categories/tree` | No corresponding backend endpoint found |
| app\[locale]\content\categories\page.tsx | 82 | POST | `/v1/tags/categories` | No corresponding backend endpoint found |
| app\[locale]\content\categories\page.tsx | 92 | PUT | `/v1/tags/categories/${id}` | No corresponding backend endpoint found |
| app\[locale]\content\categories\page.tsx | 102 | DELETE | `/v1/tags/categories/${id}` | No corresponding backend endpoint found |
| app\[locale]\content\schedule\page.tsx | 115 | PUT | `/v1/scheduled-tasks/${id}` | No corresponding backend endpoint found |
| app\[locale]\content\schedule\page.tsx | 127 | DELETE | `/v1/scheduled-tasks/${id}` | No corresponding backend endpoint found |
| app\[locale]\content\schedule\page.tsx | 141 | PUT | `/v1/content/schedule/${id}/toggle` | No corresponding backend endpoint found |
| app\[locale]\content\tags\page.tsx | 43 | GET | `/v1/tags/` | No corresponding backend endpoint found |
| app\[locale]\content\tags\page.tsx | 94 | PUT | `/v1/tags/${id}` | No corresponding backend endpoint found |
| app\[locale]\content\tags\page.tsx | 104 | DELETE | `/v1/tags/${id}` | No corresponding backend endpoint found |
| app\[locale]\content\templates\page.tsx | 96 | PUT | `/v1/templates/${id}` | No corresponding backend endpoint found |
| app\[locale]\content\templates\page.tsx | 108 | DELETE | `/v1/templates/${id}` | No corresponding backend endpoint found |
| app\[locale]\profile\notifications\page.tsx | 83 | GET | `/v1/users/preferences/notifications` | No corresponding backend endpoint found |
| app\[locale]\profile\notifications\page.tsx | 205 | PUT | `/v1/users/preferences/notifications` | No corresponding backend endpoint found |
| components\admin\TeamManagement.tsx | 119 | GET | `/v1/rbac/roles?skip=0&limit=100` | No corresponding backend endpoint found |
| components\announcements\AnnouncementBanner.tsx | 66 | POST | `/v1/announcements/${announcementId}/dismiss` | No corresponding backend endpoint found |
| components\backups\BackupManager.tsx | 80 | POST | `/v1/backups/${backupId}/restore` | No corresponding backend endpoint found |
| components\backups\BackupManager.tsx | 97 | DELETE | `/v1/backups/${backupId}` | No corresponding backend endpoint found |
| components\collaboration\CommentThread.tsx | 99 | PUT | `/v1/comments/${comment.id}` | No corresponding backend endpoint found |
| components\collaboration\CommentThread.tsx | 120 | DELETE | `/v1/comments/${comment.id}` | No corresponding backend endpoint found |
| components\collaboration\CommentThread.tsx | 136 | POST | `/v1/comments/${comment.id}/reactions` | No corresponding backend endpoint found |
| components\documentation\ArticleViewer.tsx | 65 | POST | `/v1/documentation/articles/${article.id}/feedback` | No corresponding backend endpoint found |
| components\email-templates\EmailTemplateManager.tsx | 77 | PUT | `/v1/email-templates/${selectedTemplate.id}` | No corresponding backend endpoint found |
| components\email-templates\EmailTemplateManager.tsx | 104 | DELETE | `/v1/email-templates/${templateId}` | No corresponding backend endpoint found |
| components\favorites\FavoriteButton.tsx | 68 | DELETE | `/v1/favorites/${entityType}/${entityId}` | No corresponding backend endpoint found |
| components\favorites\FavoritesList.tsx | 75 | DELETE | `/v1/favorites/${favorite.entity_type}/${favorite.entity_id}` | No corresponding backend endpoint found |
| components\feature-flags\FeatureFlagManager.tsx | 52 | PUT | `/v1/feature-flags/${flag.id}` | No corresponding backend endpoint found |
| components\feature-flags\FeatureFlagManager.tsx | 74 | DELETE | `/v1/feature-flags/${flagId}` | No corresponding backend endpoint found |
| components\feedback\FeedbackForm.tsx | 47 | POST | `/api/v1/feedback/feedback` | No corresponding backend endpoint found |
| components\onboarding\OnboardingWizard.tsx | 72 | POST | `/v1/onboarding/steps/${currentStep.key}/complete` | No corresponding backend endpoint found |
| components\onboarding\OnboardingWizard.tsx | 97 | POST | `/v1/onboarding/steps/${currentStep.key}/skip` | No corresponding backend endpoint found |
| components\preferences\PreferencesManager.tsx | 75 | PUT | `/v1/users/preferences` | No corresponding backend endpoint found |
| components\scheduled-tasks\TaskManager.tsx | 71 | POST | `/v1/scheduled-tasks/${taskId}/cancel` | No corresponding backend endpoint found |
| components\scheduled-tasks\TaskManager.tsx | 89 | DELETE | `/v1/scheduled-tasks/${taskId}` | No corresponding backend endpoint found |
| components\sharing\ShareList.tsx | 62 | DELETE | `/v1/shares/${shareId}` | No corresponding backend endpoint found |
| components\tags\TagInput.tsx | 80 | POST | `/v1/tags/${tag.id}/entities/${entityType}/${entityId}` | No corresponding backend endpoint found |
| components\tags\TagInput.tsx | 130 | DELETE | `/v1/tags/${tagId}/entities/${entityType}/${entityId}` | No corresponding backend endpoint found |
| components\tags\TagManager.tsx | 61 | DELETE | `/v1/tags/${tagId}` | No corresponding backend endpoint found |
| components\templates\TemplateEditor.tsx | 47 | PUT | `/v1/templates/${templateId}` | No corresponding backend endpoint found |
| components\templates\TemplateManager.tsx | 74 | POST | `/v1/templates/${template.id}/duplicate` | No corresponding backend endpoint found |
| components\templates\TemplateManager.tsx | 101 | DELETE | `/v1/templates/${templateId}` | No corresponding backend endpoint found |
| components\versions\VersionHistory.tsx | 73 | POST | `/v1/versions/${version.id}/restore` | No corresponding backend endpoint found |
| components\versions\VersionHistory.tsx | 98 | GET | `/v1/versions/${entityType}/${entityId}/compare` | No corresponding backend endpoint found |
| hooks\usePreferences.ts | 53 | PUT | `/v1/users/preferences/${key}` | No corresponding backend endpoint found |
| hooks\usePreferences.ts | 66 | PUT | `/v1/users/preferences` | No corresponding backend endpoint found |
| lib\api\admin.ts | 243 | GET | `/v1/admin/check-superadmin/${encodeURIComponent(email)}` | No corresponding backend endpoint found |
| lib\api\admin.ts | 254 | GET | `/v1/admin/check-superadmin/${encodeURIComponent(email)}` | No corresponding backend endpoint found |
| lib\api\media.ts | 94 | DELETE | `/v1/media/${id}` | No corresponding backend endpoint found |
| lib\api\notifications.ts | 116 | DELETE | `/v1/notifications/${notificationId}` | No corresponding backend endpoint found |
| lib\api\pages.ts | 102 | DELETE | `/v1/pages/id/${id}` | No corresponding backend endpoint found |
| lib\api\posts.ts | 131 | DELETE | `/v1/posts/${id}` | No corresponding backend endpoint found |
| lib\api\rbac.ts | 135 | DELETE | `/v1/rbac/roles/${roleId}` | No corresponding backend endpoint found |
| lib\api\rbac.ts | 178 | DELETE | `/v1/rbac/roles/${roleId}/permissions/${permissionId}` | No corresponding backend endpoint found |
| lib\api\rbac.ts | 219 | DELETE | `/v1/rbac/users/${userId}/roles/${roleId}` | No corresponding backend endpoint found |
| lib\api\rbac.ts | 271 | DELETE | `/v1/rbac/users/${userId}/permissions/custom/${permissionId}` | No corresponding backend endpoint found |
| lib\api\reports.ts | 98 | DELETE | `/v1/reports/${id}` | No corresponding backend endpoint found |
| lib\api.ts | 176 | POST | `/v1/auth/refresh` | No corresponding backend endpoint found |
| lib\api.ts | 234 | POST | `/v1/auth/login` | No corresponding backend endpoint found |
| lib\api.ts | 241 | POST | `/v1/auth/register` | No corresponding backend endpoint found |
| lib\api.ts | 249 | POST | `/v1/auth/refresh` | No corresponding backend endpoint found |
| lib\api.ts | 252 | POST | `/v1/auth/logout` | No corresponding backend endpoint found |
| lib\api.ts | 256 | GET | `/v1/auth/google` | No corresponding backend endpoint found |
| lib\api.ts | 262 | GET | `/v1/auth/me` | No corresponding backend endpoint found |
| lib\api.ts | 265 | PUT | `/v1/users/me` | No corresponding backend endpoint found |
| lib\api.ts | 268 | GET | `/v1/users/${userId}` | No corresponding backend endpoint found |
| lib\api.ts | 271 | GET | `/v1/users` | No corresponding backend endpoint found |
| lib\api.ts | 280 | POST | `/v1/users` | No corresponding backend endpoint found |
| lib\api.ts | 289 | PUT | `/v1/users/${userId}` | No corresponding backend endpoint found |
| lib\api.ts | 292 | DELETE | `/v1/users/${userId}` | No corresponding backend endpoint found |
| lib\api.ts | 298 | GET | `/resources` | No corresponding backend endpoint found |
| lib\api.ts | 301 | GET | `/resources/${resourceId}` | No corresponding backend endpoint found |
| lib\api.ts | 304 | POST | `/resources` | No corresponding backend endpoint found |
| lib\api.ts | 307 | PUT | `/resources/${resourceId}` | No corresponding backend endpoint found |
| lib\api.ts | 310 | DELETE | `/resources/${resourceId}` | No corresponding backend endpoint found |
| lib\api.ts | 316 | GET | `/v1/projects` | No corresponding backend endpoint found |
| lib\api.ts | 319 | GET | `/v1/projects/${projectId}` | No corresponding backend endpoint found |
| lib\api.ts | 326 | POST | `/v1/projects` | No corresponding backend endpoint found |
| lib\api.ts | 333 | PUT | `/v1/projects/${projectId}` | No corresponding backend endpoint found |
| lib\api.ts | 336 | DELETE | `/v1/projects/${projectId}` | No corresponding backend endpoint found |
| lib\api.ts | 342 | GET | `/v1/ai/health` | No corresponding backend endpoint found |
| lib\api.ts | 345 | POST | `/v1/ai/chat/simple` | No corresponding backend endpoint found |
| lib\api.ts | 348 | POST | `/v1/ai/chat` | No corresponding backend endpoint found |
| lib\api.ts | 354 | GET | `/email/health` | No corresponding backend endpoint found |
| lib\api.ts | 357 | POST | `/email/test` | No corresponding backend endpoint found |
| lib\api.ts | 360 | POST | `/email/welcome` | No corresponding backend endpoint found |
| lib\api.ts | 370 | POST | `/email/send` | No corresponding backend endpoint found |
| lib\api.ts | 381 | GET | `/v1/subscriptions/plans/${planId}` | No corresponding backend endpoint found |
| lib\api.ts | 403 | POST | `/v1/subscriptions/upgrade/${planId}` | No corresponding backend endpoint found |
| lib\api.ts | 406 | GET | `/v1/subscriptions/payments` | No corresponding backend endpoint found |
| lib\api.ts | 412 | GET | `/v1/teams?skip=${skip}&limit=${limit}` | No corresponding backend endpoint found |
| lib\api.ts | 415 | GET | `/v1/teams/${teamId}` | No corresponding backend endpoint found |
| lib\api.ts | 418 | POST | `/v1/teams` | No corresponding backend endpoint found |
| lib\api.ts | 421 | PUT | `/v1/teams/${teamId}` | No corresponding backend endpoint found |
| lib\api.ts | 424 | DELETE | `/v1/teams/${teamId}` | No corresponding backend endpoint found |
| lib\api.ts | 427 | GET | `/v1/teams/${teamId}/members` | No corresponding backend endpoint found |
| lib\api.ts | 430 | POST | `/v1/teams/${teamId}/members` | No corresponding backend endpoint found |
| lib\api.ts | 433 | DELETE | `/v1/teams/${teamId}/members/${memberId}` | No corresponding backend endpoint found |
| lib\api.ts | 436 | PUT | `/v1/teams/${teamId}/members/${memberId}` | No corresponding backend endpoint found |
| lib\api.ts | 442 | GET | `/v1/invitations` | No corresponding backend endpoint found |
| lib\api.ts | 445 | GET | `/v1/invitations/${invitationId}` | No corresponding backend endpoint found |
| lib\api.ts | 448 | POST | `/v1/invitations` | No corresponding backend endpoint found |
| lib\api.ts | 451 | DELETE | `/v1/invitations/${invitationId}` | No corresponding backend endpoint found |
| lib\api.ts | 454 | POST | `/v1/invitations/${invitationId}/resend` | No corresponding backend endpoint found |
| lib\api.ts | 457 | POST | `/v1/invitations/${invitationId}/accept` | No corresponding backend endpoint found |
| lib\api.ts | 463 | GET | `/v1/integrations/` | No corresponding backend endpoint found |
| lib\api.ts | 466 | GET | `/v1/integrations/${integrationId}` | No corresponding backend endpoint found |
| lib\api.ts | 475 | POST | `/v1/integrations/` | No corresponding backend endpoint found |
| lib\api.ts | 484 | PUT | `/v1/integrations/${integrationId}` | No corresponding backend endpoint found |
| lib\api.ts | 487 | PATCH | `/v1/integrations/${integrationId}/toggle` | No corresponding backend endpoint found |
| lib\api.ts | 490 | DELETE | `/v1/integrations/${integrationId}` | No corresponding backend endpoint found |
| lib\api.ts | 496 | GET | `/v1/api-settings/` | No corresponding backend endpoint found |
| lib\api.ts | 505 | PUT | `/v1/api-settings/` | No corresponding backend endpoint found |
| lib\api.ts | 514 | GET | `/v1/pages/${slug}` | No corresponding backend endpoint found |
| lib\api.ts | 540 | PUT | `/v1/pages/${slug}` | No corresponding backend endpoint found |
| lib\api.ts | 543 | DELETE | `/v1/pages/${slug}` | No corresponding backend endpoint found |
| lib\api.ts | 552 | GET | `/v1/forms/${formId}` | No corresponding backend endpoint found |
| lib\api.ts | 588 | PUT | `/v1/forms/${formId}` | No corresponding backend endpoint found |
| lib\api.ts | 591 | DELETE | `/v1/forms/${formId}` | No corresponding backend endpoint found |
| lib\api.ts | 594 | POST | `/v1/forms/${formId}/submissions` | No corresponding backend endpoint found |
| lib\api.ts | 597 | GET | `/v1/forms/${formId}/submissions` | No corresponding backend endpoint found |
| lib\api.ts | 600 | DELETE | `/v1/forms/submissions/${submissionId}` | No corresponding backend endpoint found |
| lib\api.ts | 609 | GET | `/v1/menus/${menuId}` | No corresponding backend endpoint found |
| lib\api.ts | 635 | PUT | `/v1/menus/${menuId}` | No corresponding backend endpoint found |
| lib\api.ts | 638 | DELETE | `/v1/menus/${menuId}` | No corresponding backend endpoint found |
| lib\api.ts | 647 | GET | `/v1/support/tickets/${ticketId}` | No corresponding backend endpoint found |
| lib\api.ts | 664 | PUT | `/v1/support/tickets/${ticketId}` | No corresponding backend endpoint found |
| lib\api.ts | 667 | GET | `/v1/support/tickets/${ticketId}/messages` | No corresponding backend endpoint found |
| lib\api.ts | 670 | POST | `/v1/support/tickets/${ticketId}/messages` | No corresponding backend endpoint found |
| lib\api.ts | 704 | GET | `/v1/forms/${surveyId}` | No corresponding backend endpoint found |
| lib\api.ts | 724 | PUT | `/v1/forms/${surveyId}` | No corresponding backend endpoint found |
| lib\api.ts | 727 | DELETE | `/v1/forms/${surveyId}` | No corresponding backend endpoint found |
| lib\api.ts | 730 | POST | `/v1/forms/${surveyId}/submissions` | No corresponding backend endpoint found |
| lib\api.ts | 733 | GET | `/v1/forms/${surveyId}/submissions` | No corresponding backend endpoint found |
| lib\api.ts | 736 | GET | `/v1/forms/${surveyId}/statistics` | No corresponding backend endpoint found |
| lib\api.ts | 739 | GET | `/v1/forms/${surveyId}/export` | No corresponding backend endpoint found |
| lib\errors\api.ts | 97 | GET | `/users` | No corresponding backend endpoint found |

## 🔍 All Frontend fetch() Calls

| File | Line | Method | URL |
|------|------|--------|-----|
| app\admin\users\AdminUsersContent.tsx | 76 | DELETE | `/api/v1/users/${selectedUser.id}` |
| app\api\themes\route.ts | 57 | GET | `${API_URL}/api/v1/themes/active` |
| app\docs\page.tsx | 156 | GET | `/api/v1/users` |
| app\[locale]\admin\settings\AdminSettingsContent.tsx | 37 | PUT | `${getApiUrl()}/api/v1/admin/settings` |
| app\[locale]\docs\page.tsx | 156 | GET | `/api/v1/users` |
| app\[locale]\examples\api-fetching\page.tsx | 61 | GET | `https://jsonplaceholder.typicode.com/posts` |
| lib\api\admin.ts | 36 | POST | `${API_URL}/api/v1/admin/bootstrap-superadmin` |
| lib\api\admin.ts | 75 | POST | `${API_URL}/api/v1/admin/make-superadmin` |
| lib\auth\config.ts | 110 | POST | `${process.env.NEXTAUTH_URL}/api/auth/refresh` |
| lib\auth\secureCookieStorage.ts | 81 | POST | `${TOKEN_API_ENDPOINT}/rotate` |
| lib\auth\secureCookieStorage.ts | 111 | GET | `${TOKEN_API_ENDPOINT}/session` |
| lib\auth\secureCookieStorage.ts | 168 | POST | `${TOKEN_API_ENDPOINT}/refresh` |
| lib\performance\preloading.ts | 106 | GET | `//${apiHost}` |
| lib\utils\rateLimiter.ts | 12 | GET | `/api/users` |
| lib\utils\rateLimiter.ts | 60 | GET | `/api/users` |

## 🔍 All Frontend apiClient Calls

| File | Line | Method | URL |
|------|------|--------|-----|
| app\admin\settings\AdminSettingsContent.tsx | 30 | PUT | `/v1/users/me` |
| app\admin\users\AdminUsersContent.tsx | 44 | GET | `/v1/users?page=1&page_size=100` |
| app\[locale]\admin\statistics\AdminStatisticsContent.tsx | 32 | GET | `/v1/users?page=1&page_size=1` |
| app\[locale]\admin\statistics\AdminStatisticsContent.tsx | 56 | GET | `/v1/audit-trail/audit-trail?limit=1&offset=0` |
| app\[locale]\admin\tenancy\TenancyContent.tsx | 54 | GET | `/v1/admin/tenancy/config` |
| app\[locale]\admin\tenancy\TenancyContent.tsx | 79 | PUT | `/v1/admin/tenancy/config` |
| app\[locale]\admin\users\AdminUsersContent.tsx | 47 | GET | `/v1/users?page=1&page_size=100` |
| app\[locale]\admin\users\AdminUsersContent.tsx | 80 | DELETE | `/v1/users/${selectedUser.id}` |
| app\[locale]\content\categories\page.tsx | 43 | GET | `/v1/tags/categories/tree` |
| app\[locale]\content\categories\page.tsx | 82 | POST | `/v1/tags/categories` |
| app\[locale]\content\categories\page.tsx | 92 | PUT | `/v1/tags/categories/${id}` |
| app\[locale]\content\categories\page.tsx | 102 | DELETE | `/v1/tags/categories/${id}` |
| app\[locale]\content\schedule\page.tsx | 43 | GET | `/v1/scheduled-tasks` |
| app\[locale]\content\schedule\page.tsx | 93 | POST | `/v1/scheduled-tasks` |
| app\[locale]\content\schedule\page.tsx | 115 | PUT | `/v1/scheduled-tasks/${id}` |
| app\[locale]\content\schedule\page.tsx | 127 | DELETE | `/v1/scheduled-tasks/${id}` |
| app\[locale]\content\schedule\page.tsx | 141 | PUT | `/v1/content/schedule/${id}/toggle` |
| app\[locale]\content\tags\page.tsx | 43 | GET | `/v1/tags/` |
| app\[locale]\content\tags\page.tsx | 81 | POST | `/v1/tags` |
| app\[locale]\content\tags\page.tsx | 94 | PUT | `/v1/tags/${id}` |
| app\[locale]\content\tags\page.tsx | 104 | DELETE | `/v1/tags/${id}` |
| app\[locale]\content\templates\page.tsx | 43 | GET | `/v1/templates` |
| app\[locale]\content\templates\page.tsx | 84 | POST | `/v1/templates` |
| app\[locale]\content\templates\page.tsx | 96 | PUT | `/v1/templates/${id}` |
| app\[locale]\content\templates\page.tsx | 108 | DELETE | `/v1/templates/${id}` |
| app\[locale]\profile\notifications\page.tsx | 83 | GET | `/v1/users/preferences/notifications` |
| app\[locale]\profile\notifications\page.tsx | 205 | PUT | `/v1/users/preferences/notifications` |
| components\admin\TeamManagement.tsx | 119 | GET | `/v1/rbac/roles?skip=0&limit=100` |
| components\announcements\AnnouncementBanner.tsx | 66 | POST | `/v1/announcements/${announcementId}/dismiss` |
| components\backups\BackupManager.tsx | 80 | POST | `/v1/backups/${backupId}/restore` |
| components\backups\BackupManager.tsx | 97 | DELETE | `/v1/backups/${backupId}` |
| components\collaboration\CommentThread.tsx | 74 | POST | `/v1/comments` |
| components\collaboration\CommentThread.tsx | 99 | PUT | `/v1/comments/${comment.id}` |
| components\collaboration\CommentThread.tsx | 120 | DELETE | `/v1/comments/${comment.id}` |
| components\collaboration\CommentThread.tsx | 136 | POST | `/v1/comments/${comment.id}/reactions` |
| components\documentation\ArticleViewer.tsx | 65 | POST | `/v1/documentation/articles/${article.id}/feedback` |
| components\email-templates\EmailTemplateManager.tsx | 77 | PUT | `/v1/email-templates/${selectedTemplate.id}` |
| components\email-templates\EmailTemplateManager.tsx | 104 | DELETE | `/v1/email-templates/${templateId}` |
| components\favorites\FavoriteButton.tsx | 68 | DELETE | `/v1/favorites/${entityType}/${entityId}` |
| components\favorites\FavoriteButton.tsx | 78 | POST | `/v1/favorites` |
| components\favorites\FavoritesList.tsx | 75 | DELETE | `/v1/favorites/${favorite.entity_type}/${favorite.entity_id}` |
| components\feature-flags\FeatureFlagManager.tsx | 52 | PUT | `/v1/feature-flags/${flag.id}` |
| components\feature-flags\FeatureFlagManager.tsx | 74 | DELETE | `/v1/feature-flags/${flagId}` |
| components\feedback\FeedbackForm.tsx | 47 | POST | `/api/v1/feedback/feedback` |
| components\onboarding\OnboardingWizard.tsx | 43 | POST | `/v1/onboarding/initialize` |
| components\onboarding\OnboardingWizard.tsx | 72 | POST | `/v1/onboarding/steps/${currentStep.key}/complete` |
| components\onboarding\OnboardingWizard.tsx | 97 | POST | `/v1/onboarding/steps/${currentStep.key}/skip` |
| components\preferences\PreferencesManager.tsx | 75 | PUT | `/v1/users/preferences` |
| components\scheduled-tasks\TaskManager.tsx | 71 | POST | `/v1/scheduled-tasks/${taskId}/cancel` |
| components\scheduled-tasks\TaskManager.tsx | 89 | DELETE | `/v1/scheduled-tasks/${taskId}` |
| components\sharing\ShareDialog.tsx | 56 | POST | `/v1/shares` |
| components\sharing\ShareList.tsx | 62 | DELETE | `/v1/shares/${shareId}` |
| components\tags\TagInput.tsx | 80 | POST | `/v1/tags/${tag.id}/entities/${entityType}/${entityId}` |
| components\tags\TagInput.tsx | 130 | DELETE | `/v1/tags/${tagId}/entities/${entityType}/${entityId}` |
| components\tags\TagManager.tsx | 61 | DELETE | `/v1/tags/${tagId}` |
| components\templates\TemplateEditor.tsx | 47 | PUT | `/v1/templates/${templateId}` |
| components\templates\TemplateManager.tsx | 74 | POST | `/v1/templates/${template.id}/duplicate` |
| components\templates\TemplateManager.tsx | 101 | DELETE | `/v1/templates/${templateId}` |
| components\versions\VersionHistory.tsx | 73 | POST | `/v1/versions/${version.id}/restore` |
| components\versions\VersionHistory.tsx | 98 | GET | `/v1/versions/${entityType}/${entityId}/compare` |
| hooks\usePreferences.ts | 53 | PUT | `/v1/users/preferences/${key}` |
| hooks\usePreferences.ts | 66 | PUT | `/v1/users/preferences` |
| lib\api\admin.ts | 243 | GET | `/v1/admin/check-superadmin/${encodeURIComponent(email)}` |
| lib\api\admin.ts | 254 | GET | `/v1/admin/check-superadmin/${encodeURIComponent(email)}` |
| lib\api\media.ts | 94 | DELETE | `/v1/media/${id}` |
| lib\api\notifications.ts | 116 | DELETE | `/v1/notifications/${notificationId}` |
| lib\api\pages.ts | 102 | DELETE | `/v1/pages/id/${id}` |
| lib\api\posts.ts | 131 | DELETE | `/v1/posts/${id}` |
| lib\api\rbac.ts | 135 | DELETE | `/v1/rbac/roles/${roleId}` |
| lib\api\rbac.ts | 178 | DELETE | `/v1/rbac/roles/${roleId}/permissions/${permissionId}` |
| lib\api\rbac.ts | 219 | DELETE | `/v1/rbac/users/${userId}/roles/${roleId}` |
| lib\api\rbac.ts | 271 | DELETE | `/v1/rbac/users/${userId}/permissions/custom/${permissionId}` |
| lib\api\reports.ts | 98 | DELETE | `/v1/reports/${id}` |
| lib\api.ts | 176 | POST | `/v1/auth/refresh` |
| lib\api.ts | 234 | POST | `/v1/auth/login` |
| lib\api.ts | 241 | POST | `/v1/auth/register` |
| lib\api.ts | 249 | POST | `/v1/auth/refresh` |
| lib\api.ts | 252 | POST | `/v1/auth/logout` |
| lib\api.ts | 256 | GET | `/v1/auth/google` |
| lib\api.ts | 262 | GET | `/v1/auth/me` |
| lib\api.ts | 265 | PUT | `/v1/users/me` |
| lib\api.ts | 268 | GET | `/v1/users/${userId}` |
| lib\api.ts | 271 | GET | `/v1/users` |
| lib\api.ts | 280 | POST | `/v1/users` |
| lib\api.ts | 289 | PUT | `/v1/users/${userId}` |
| lib\api.ts | 292 | DELETE | `/v1/users/${userId}` |
| lib\api.ts | 298 | GET | `/resources` |
| lib\api.ts | 301 | GET | `/resources/${resourceId}` |
| lib\api.ts | 304 | POST | `/resources` |
| lib\api.ts | 307 | PUT | `/resources/${resourceId}` |
| lib\api.ts | 310 | DELETE | `/resources/${resourceId}` |
| lib\api.ts | 316 | GET | `/v1/projects` |
| lib\api.ts | 319 | GET | `/v1/projects/${projectId}` |
| lib\api.ts | 326 | POST | `/v1/projects` |
| lib\api.ts | 333 | PUT | `/v1/projects/${projectId}` |
| lib\api.ts | 336 | DELETE | `/v1/projects/${projectId}` |
| lib\api.ts | 342 | GET | `/v1/ai/health` |
| lib\api.ts | 345 | POST | `/v1/ai/chat/simple` |
| lib\api.ts | 348 | POST | `/v1/ai/chat` |
| lib\api.ts | 354 | GET | `/email/health` |
| lib\api.ts | 357 | POST | `/email/test` |
| lib\api.ts | 360 | POST | `/email/welcome` |
| lib\api.ts | 370 | POST | `/email/send` |
| lib\api.ts | 376 | GET | `/v1/subscriptions/plans` |
| lib\api.ts | 381 | GET | `/v1/subscriptions/plans/${planId}` |
| lib\api.ts | 384 | GET | `/v1/subscriptions/me` |
| lib\api.ts | 392 | POST | `/v1/subscriptions/checkout` |
| lib\api.ts | 395 | POST | `/v1/subscriptions/portal` |
| lib\api.ts | 400 | POST | `/v1/subscriptions/cancel` |
| lib\api.ts | 403 | POST | `/v1/subscriptions/upgrade/${planId}` |
| lib\api.ts | 406 | GET | `/v1/subscriptions/payments` |
| lib\api.ts | 412 | GET | `/v1/teams?skip=${skip}&limit=${limit}` |
| lib\api.ts | 415 | GET | `/v1/teams/${teamId}` |
| lib\api.ts | 418 | POST | `/v1/teams` |
| lib\api.ts | 421 | PUT | `/v1/teams/${teamId}` |
| lib\api.ts | 424 | DELETE | `/v1/teams/${teamId}` |
| lib\api.ts | 427 | GET | `/v1/teams/${teamId}/members` |
| lib\api.ts | 430 | POST | `/v1/teams/${teamId}/members` |
| lib\api.ts | 433 | DELETE | `/v1/teams/${teamId}/members/${memberId}` |
| lib\api.ts | 436 | PUT | `/v1/teams/${teamId}/members/${memberId}` |
| lib\api.ts | 442 | GET | `/v1/invitations` |
| lib\api.ts | 445 | GET | `/v1/invitations/${invitationId}` |
| lib\api.ts | 448 | POST | `/v1/invitations` |
| lib\api.ts | 451 | DELETE | `/v1/invitations/${invitationId}` |
| lib\api.ts | 454 | POST | `/v1/invitations/${invitationId}/resend` |
| lib\api.ts | 457 | POST | `/v1/invitations/${invitationId}/accept` |
| lib\api.ts | 463 | GET | `/v1/integrations/` |
| lib\api.ts | 466 | GET | `/v1/integrations/${integrationId}` |
| lib\api.ts | 475 | POST | `/v1/integrations/` |
| lib\api.ts | 484 | PUT | `/v1/integrations/${integrationId}` |
| lib\api.ts | 487 | PATCH | `/v1/integrations/${integrationId}/toggle` |
| lib\api.ts | 490 | DELETE | `/v1/integrations/${integrationId}` |
| lib\api.ts | 496 | GET | `/v1/api-settings/` |
| lib\api.ts | 505 | PUT | `/v1/api-settings/` |
| lib\api.ts | 511 | GET | `/v1/pages` |
| lib\api.ts | 514 | GET | `/v1/pages/${slug}` |
| lib\api.ts | 527 | POST | `/v1/pages` |
| lib\api.ts | 540 | PUT | `/v1/pages/${slug}` |
| lib\api.ts | 543 | DELETE | `/v1/pages/${slug}` |
| lib\api.ts | 549 | GET | `/v1/forms` |
| lib\api.ts | 552 | GET | `/v1/forms/${formId}` |
| lib\api.ts | 570 | POST | `/v1/forms` |
| lib\api.ts | 588 | PUT | `/v1/forms/${formId}` |
| lib\api.ts | 591 | DELETE | `/v1/forms/${formId}` |
| lib\api.ts | 594 | POST | `/v1/forms/${formId}/submissions` |
| lib\api.ts | 597 | GET | `/v1/forms/${formId}/submissions` |
| lib\api.ts | 600 | DELETE | `/v1/forms/submissions/${submissionId}` |
| lib\api.ts | 606 | GET | `/v1/menus` |
| lib\api.ts | 609 | GET | `/v1/menus/${menuId}` |
| lib\api.ts | 622 | POST | `/v1/menus` |
| lib\api.ts | 635 | PUT | `/v1/menus/${menuId}` |
| lib\api.ts | 638 | DELETE | `/v1/menus/${menuId}` |
| lib\api.ts | 644 | GET | `/v1/support/tickets` |
| lib\api.ts | 647 | GET | `/v1/support/tickets/${ticketId}` |
| lib\api.ts | 656 | POST | `/v1/support/tickets` |
| lib\api.ts | 664 | PUT | `/v1/support/tickets/${ticketId}` |
| lib\api.ts | 667 | GET | `/v1/support/tickets/${ticketId}/messages` |
| lib\api.ts | 670 | POST | `/v1/support/tickets/${ticketId}/messages` |
| lib\api.ts | 676 | GET | `/v1/seo/settings` |
| lib\api.ts | 694 | PUT | `/v1/seo/settings` |
| lib\api.ts | 701 | GET | `/v1/forms` |
| lib\api.ts | 704 | GET | `/v1/forms/${surveyId}` |
| lib\api.ts | 714 | POST | `/v1/forms` |
| lib\api.ts | 724 | PUT | `/v1/forms/${surveyId}` |
| lib\api.ts | 727 | DELETE | `/v1/forms/${surveyId}` |
| lib\api.ts | 730 | POST | `/v1/forms/${surveyId}/submissions` |
| lib\api.ts | 733 | GET | `/v1/forms/${surveyId}/submissions` |
| lib\api.ts | 736 | GET | `/v1/forms/${surveyId}/statistics` |
| lib\api.ts | 739 | GET | `/v1/forms/${surveyId}/export` |
| lib\errors\api.ts | 97 | GET | `/users` |

