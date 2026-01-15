# AUDIT DES BOUTONS - PAGES ADMIN/DASHBOARD

Date: 15/01/2026 14:01:24

## 📊 RÉSUMÉ

- **Total de boutons trouvés**: 311
- **Boutons avec background color**: 136
- **Boutons avec seulement border**: 141
- **Boutons ghost (sans border ni background)**: 34
- **Boutons non catégorisés**: 0

---

## 🎨 BOUTONS AVEC BACKGROUND COLOR

**Total: 136**

### Variant: `arise-primary` (10)

1. **router.push('/dashboard/assessments/mbti/upload')}
                    className="w-full"
                  >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\results\page.tsx`
   - Ligne: 139
   - Type: Button

2. **router.push('/dashboard/coaching-options')}
            >
              Explore coaching options →**
   - Fichier: `apps\web\src\app\[locale]\dashboard\development-plan\page.tsx`
   - Ligne: 261
   - Type: Button

3. **setShowEvaluatorModal(true)}
                style={{ width: 'fit-content' }}
              >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
   - Ligne: 682
   - Type: Button

4. **Try Again**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 138
   - Type: Button

5. **{
                        // Check if a 360° feedback assessment already exists
                        const feedback360Assessment = assessments.find(
                          a => a.assessment_type === 'THREE_SIXTY_SELF'
                        );
                        
                        if (feedback360Assessment?.id) {
                          // Open modal directly if assessment exists
                          setShowEvaluatorModal(true);
                        } else {
                          // Redirect to start page if no assessment exists yet
                          router.push('/dashboard/assessments/360-feedback/start');
                        }
                      }}
                    >
                      Add Evaluators**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 518
   - Type: Button

6. **router.push('/dashboard/coaching-options')}
                  >
                    Explore coaching options →**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 734
   - Type: Button

7. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 700
   - Type: Button

8. **handleViewDetails(assessment)}
                        >
                          View Details**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 746
   - Type: Button

9. **{isGeneratingPDF ? 'Generating PDF...' : 'Download Complete Leadership Profile'}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 887
   - Type: Button

10. **router.push('/dashboard/coaching-options')}
                >
                  Explore coaching options →**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 921
   - Type: Button

### Variant: `danger` (19)

1. **{
              setSelectedUser(row);
              setDeleteModalOpen(true);
            }}
          >
            Supprimer**
   - Fichier: `apps\web\src\app\admin\users\AdminUsersContent.tsx`
   - Ligne: 134
   - Type: Button

2. **Supprimer**
   - Fichier: `apps\web\src\app\admin\users\AdminUsersContent.tsx`
   - Ligne: 213
   - Type: Button

3. **(sans texte)**
   - Fichier: `apps\web\src\app\dashboard\layout.tsx`
   - Ligne: 172
   - Type: Button

4. **Révoquer**
   - Fichier: `apps\web\src\app\[locale]\admin\api-keys\AdminAPIKeysContent.tsx`
   - Ligne: 309
   - Type: Button

5. **Supprimer**
   - Fichier: `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
   - Ligne: 246
   - Type: Button

6. **Delete**
   - Fichier: `apps\web\src\app\[locale]\admin\media\AdminMediaContent.tsx`
   - Ligne: 269
   - Type: Button

7. **Supprimer**
   - Fichier: `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
   - Ligne: 245
   - Type: Button

8. **{deleting ? 'Suppression...' : 'Supprimer'}**
   - Fichier: `apps\web\src\app\[locale]\admin\rbac\page.tsx`
   - Ligne: 318
   - Type: Button

9. **Danger**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeLivePreview.tsx`
   - Ligne: 43
   - Type: Button

10. **{isLoading ? 'Suppression...' : 'Supprimer'}**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeActions.tsx`
   - Ligne: 229
   - Type: Button

11. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeListItem.tsx`
   - Ligne: 102
   - Type: Button

12. **Bouton Danger**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemePreview.tsx`
   - Ligne: 112
   - Type: Button

13. **{
              setSelectedUser(row);
              setDeleteModalOpen(true);
            }}
            className="text-xs sm:text-sm"
          >
            Supprimer**
   - Fichier: `apps\web\src\app\[locale]\admin\users\AdminUsersContent.tsx`
   - Ligne: 155
   - Type: Button

14. **Supprimer**
   - Fichier: `apps\web\src\app\[locale]\admin\users\AdminUsersContent.tsx`
   - Ligne: 286
   - Type: Button

15. **setBulkDeleteModalOpen(true)}
                disabled={bulkDeleting}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                {bulkDeleting ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 291
   - Type: Button

16. **{deleting ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 560
   - Type: Button

17. **{bulkDeleting ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 609
   - Type: Button

18. **setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 542
   - Type: Button

19. **{isDeleting ? 'Suppression...' : 'Confirmer la suppression'}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 585
   - Type: Button

### Variant: `primary` (72)

1. **Gérer les invitations**
   - Fichier: `apps\web\src\app\admin\AdminContent.tsx`
   - Ligne: 25
   - Type: Button

2. **Gérer les utilisateurs**
   - Fichier: `apps\web\src\app\admin\AdminContent.tsx`
   - Ligne: 36
   - Type: Button

3. **Gérer les organisations**
   - Fichier: `apps\web\src\app\admin\AdminContent.tsx`
   - Ligne: 47
   - Type: Button

4. **Configurer**
   - Fichier: `apps\web\src\app\admin\AdminContent.tsx`
   - Ligne: 59
   - Type: Button

5. **Voir les logs**
   - Fichier: `apps\web\src\app\admin\AdminContent.tsx`
   - Ligne: 70
   - Type: Button

6. **Voir les statistiques**
   - Fichier: `apps\web\src\app\admin\AdminContent.tsx`
   - Ligne: 81
   - Type: Button

7. **Enregistrer**
   - Fichier: `apps\web\src\app\admin\settings\AdminSettingsContent.tsx`
   - Ligne: 82
   - Type: Button

8. **{loading ? 'Création en cours...' : 'Créer Superadmin (Bootstrap)'}**
   - Fichier: `apps\web\src\app\dashboard\become-superadmin\page.tsx`
   - Ligne: 212
   - Type: Button

9. **{loading ? 'Création en cours...' : 'Créer Superadmin'}**
   - Fichier: `apps\web\src\app\dashboard\become-superadmin\page.tsx`
   - Ligne: 258
   - Type: Button

10. **Gérer les invitations**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 56
   - Type: Button

11. **Gérer les utilisateurs**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 67
   - Type: Button

12. **Gérer les organisations**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 78
   - Type: Button

13. **Gérer les thèmes**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 89
   - Type: Button

14. **Gérer les plans**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 100
   - Type: Button

15. **Configurer**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 111
   - Type: Button

16. **Voir les logs**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 122
   - Type: Button

17. **Voir les statistiques**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 133
   - Type: Button

18. **Gérer les clés API**
   - Fichier: `apps\web\src\app\[locale]\admin\AdminContent.tsx`
   - Ligne: 144
   - Type: Button

19. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
   - Ligne: 194
   - Type: Button

20. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
   - Ligne: 193
   - Type: Button

21. **setShowCreateModal(true)}
                className="flex flex-row items-center gap-2"
              >**
   - Fichier: `apps\web\src\app\[locale]\admin\plans\page.tsx`
   - Ligne: 250
   - Type: Button

22. **handleSave(plan.id)}
                          className="flex flex-row items-center gap-2"
                        >**
   - Fichier: `apps\web\src\app\[locale]\admin\plans\page.tsx`
   - Ligne: 336
   - Type: Button

23. **{creatingPlan ? (**
   - Fichier: `apps\web\src\app\[locale]\admin\plans\page.tsx`
   - Ligne: 555
   - Type: Button

24. **Enregistrer les paramètres**
   - Fichier: `apps\web\src\app\[locale]\admin\settings\AdminSettingsContent.tsx`
   - Ligne: 153
   - Type: Button

25. **{saving ? t('saving') || 'Saving...' : t('save') || 'Save Configuration'}**
   - Fichier: `apps\web\src\app\[locale]\admin\tenancy\TenancyContent.tsx`
   - Ligne: 238
   - Type: Button

26. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeBuilder.tsx`
   - Ligne: 74
   - Type: Button

27. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeExportImport.tsx`
   - Ligne: 71
   - Type: Button

28. **Import from JSON**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeExportImport.tsx`
   - Ligne: 133
   - Type: Button

29. **Primary**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeLivePreview.tsx`
   - Ligne: 40
   - Type: Button

30. **Use This Preset**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemePresets.tsx`
   - Ligne: 65
   - Type: Button

31. **{isLoading ? 'Activation...' : 'Activer'}**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeActions.tsx`
   - Ligne: 163
   - Type: Button

32. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeEditor.tsx`
   - Ligne: 372
   - Type: Button

33. **Réessayer**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeList.tsx`
   - Ligne: 152
   - Type: Button

34. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeList.tsx`
   - Ligne: 176
   - Type: Button

35. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeList.tsx`
   - Ligne: 185
   - Type: Button

36. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeListItem.tsx`
   - Ligne: 70
   - Type: Button

37. **Bouton Primaire**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemePreview.tsx`
   - Ligne: 108
   - Type: Button

38. **{
                  setEditingQuestion({ 
                    question_id: '', 
                    assessment_type: selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR' ? '360_self' : selectedTestType.toLowerCase(),
                    text: '', 
                    question: '',
                    pillar: '' 
                  } as Question);
                  setQuestionEditModalOpen(true);
                }}
                className="flex items-center gap-2"
              >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 743
   - Type: Button

39. **{
                  setEditingQuestion({ 
                    question_id: '', 
                    assessment_type: selectedTestType === 'THREE_SIXTY_SELF' || selectedTestType === 'THREE_SIXTY_EVALUATOR' ? '360_self' : selectedTestType.toLowerCase(),
                    text: '', 
                    question: '',
                    pillar: '' 
                  } as Question);
                  setQuestionEditModalOpen(true);
                }}
                className="flex items-center gap-2 mx-auto"
              >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 787
   - Type: Button

40. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 1164
   - Type: Button

41. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 1510
   - Type: Button

42. **{makingSuperAdmin ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 659
   - Type: Button

43. **window.open('https://www.16personalities.com/free-personality-test', '_blank')}
                  className="w-full flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#D5B667', color: '#000000' }}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\page.tsx`
   - Ligne: 97
   - Type: Button

44. **router.push('/dashboard/assessments/mbti/upload')}
                        className="w-full flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#D5B667', color: '#000000' }}
                      >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\page.tsx`
   - Ligne: 127
   - Type: Button

45. **{isUploading ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\upload\page.tsx`
   - Ligne: 434
   - Type: Button

46. **window.location.reload()}>
                Refresh Page**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1156
   - Type: Button

47. **Retry**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1160
   - Type: Button

48. **setShowEvaluatorModal(true)}
                          >
                            Ajouter**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1570
   - Type: Button

49. **router.push('/dashboard/assessments')}
                >
                  Continue to Other Assessments**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\results\page.tsx`
   - Ligne: 612
   - Type: Button

50. **{
                      try {
                        // Reset any stale completion state before starting
                        useWellnessStore.setState({ isCompleted: false });
                        setShowCompletion(false);
                        await startAssessment();
                        // Verify assessmentId was set
                        const { assessmentId: newAssessmentId, isCompleted: newIsCompleted } = useWellnessStore.getState();
                        if (!newAssessmentId) {
                          console.error('[Wellness] startAssessment did not set assessmentId');
                          alert('Error: Unable to start the assessment. Please try again.');
                          return;
                        }
                        // Double-check that isCompleted is false after starting
                        if (newIsCompleted) {
                          console.warn('[Wellness] isCompleted is true after startAssessment - resetting');
                          useWellnessStore.setState({ isCompleted: false });
                        }
                        console.log(`[Wellness] Assessment started with ID: ${newAssessmentId}`);
                        setShowCompletion(false);
                        setShowIntro(false);
                      } catch (error) {
                        const errorMessage = formatError(error);
                        console.error('[Wellness] Failed to start assessment:', errorMessage);
                        alert('Error: Unable to start the assessment. Please try again.');
                      }
                    }}
                    disabled={isLoading}
                    className="px-8"
                  >
                    {isLoading ? 'Starting...' : 'Start Assessment'}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 354
   - Type: Button

51. **{
                      const { assessmentId } = useWellnessStore.getState();
                      if (assessmentId) {
                        router.push(`/dashboard/assessments/results?id=${assessmentId}`);
                      }
                    }}
                    className="text-white"
                    style={{ backgroundColor: '#0F4C56' }}
                    onMouseEnter={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 433
   - Type: Button

52. **) => e.currentTarget.style.backgroundColor = 'rgba(15, 76, 86, 0.9)'}
                    onMouseLeave={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 628
   - Type: Button

53. **{loading ? 'Création en cours...' : 'Créer Superadmin (Bootstrap)'}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\become-superadmin\page.tsx`
   - Ligne: 215
   - Type: Button

54. **{loading ? 'Création en cours...' : 'Créer Superadmin'}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\become-superadmin\page.tsx`
   - Ligne: 261
   - Type: Button

55. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\agenda\page.tsx`
   - Ligne: 413
   - Type: Button

56. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\coachee\page.tsx`
   - Ligne: 203
   - Type: Button

57. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\coachee\page.tsx`
   - Ligne: 228
   - Type: Button

58. **Continuer**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 442
   - Type: Button

59. **{loading ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 492
   - Type: Button

60. **{loading ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 522
   - Type: Button

61. **handleBookSession(coach.id, selectedPackage || undefined)}
                          className="bg-arise-deep-teal hover:bg-arise-deep-teal/90"
                        >
                          Réserver une session**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\page.tsx`
   - Ligne: 455
   - Type: Button

62. **router.push('/dashboard')}
                >
                  Retour au dashboard**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\page.tsx`
   - Ligne: 497
   - Type: Button

63. **router.push('/dashboard/coaching-options')}
            >
              Voir mes sessions**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\success\page.tsx`
   - Ligne: 39
   - Type: Button

64. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\development-plan\resources\[id]\page.tsx`
   - Ligne: 504
   - Type: Button

65. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\development-plan\resources\[id]\page.tsx`
   - Ligne: 515
   - Type: Button

66. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\development-plan\resources\[id]\page.tsx`
   - Ligne: 526
   - Type: Button

67. **loadEvaluators()}>
              Réessayer**
   - Fichier: `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
   - Ligne: 618
   - Type: Button

68. **setShowEvaluatorModal(true)}
                        className="font-semibold flex flex-row items-center gap-2"
                      >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
   - Ligne: 792
   - Type: Button

69. **{
          router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
        }}
      >
        Start**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 410
   - Type: Button

70. **) => {
                        e.currentTarget.style.backgroundColor = '#d5b667';
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 580
   - Type: Button

71. **router.push('/dashboard/assessments')}
              >
                Commencer un assessment**
   - Fichier: `apps\web\src\app\[locale]\dashboard\results\page.tsx`
   - Ligne: 258
   - Type: Button

72. **Download Complete Leadership Profile**
   - Fichier: `apps\web\src\app\[locale]\dashboard\results\page.tsx`
   - Ligne: 418
   - Type: Button

### Variant: `secondary` (11)

1. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeBuilder.tsx`
   - Ligne: 70
   - Type: Button

2. **{copied ? (**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeExportImport.tsx`
   - Ligne: 75
   - Type: Button

3. **fileInputRef.current?.click()}
                className="flex flex-row items-center gap-2"
              >**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeExportImport.tsx`
   - Ligne: 116
   - Type: Button

4. **Secondary**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeLivePreview.tsx`
   - Ligne: 41
   - Type: Button

5. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\page.tsx`
   - Ligne: 32
   - Type: Button

6. **Bouton Secondaire**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemePreview.tsx`
   - Ligne: 109
   - Type: Button

7. **) => {
                          e.currentTarget.style.backgroundColor = 'rgba(15, 69, 77, 0.9)';
                          e.currentTarget.style.borderColor = 'rgba(15, 69, 77, 0.9)';
                        }}
                        onMouseLeave={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\development-plan\page.tsx`
   - Ligne: 189
   - Type: Button

8. **Locked**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 303
   - Type: Button

9. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\results\page.tsx`
   - Ligne: 248
   - Type: Button

10. **handleViewDetails(assessment)}
                    >
                      View Details**
   - Fichier: `apps\web\src\app\[locale]\dashboard\results\page.tsx`
   - Ligne: 288
   - Type: Button

11. **router.push('/dashboard/coaching-options')}
            >
              Explore coaching options →**
   - Fichier: `apps\web\src\app\[locale]\dashboard\results\page.tsx`
   - Ligne: 436
   - Type: Button

### Variant: `with-background` (24)

1. **handleSelectValue(option.value)}
                        className={`
                          flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-center
                          ${isSelected
                            ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                          }
                        `}
                      >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\page.tsx`
   - Ligne: 357
   - Type: button

2. **removeEvaluator(index)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="Supprimer cet évaluateur"
                        >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\start\page.tsx`
   - Ligne: 430
   - Type: button

3. **handleSelectAnswer('A')}
                    disabled={isLoading}
                    className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedAnswer === 'A'
                        ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\tki\page.tsx`
   - Ligne: 407
   - Type: button

4. **handleSelectAnswer('B')}
                    disabled={isLoading}
                    className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedAnswer === 'B'
                        ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\tki\page.tsx`
   - Ligne: 435
   - Type: button

5. **handleAnswerSelect(option.value)}
                        className={`
                          flex-1 p-4 rounded-lg border-2 transition-all duration-200 text-center
                          ${isSelected
                            ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                          }
                        `}
                      >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 595
   - Type: button

6. **handleCoachSelect(coach)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedCoach?.id === coach.id
                      ? 'border-arise-teal bg-arise-teal/10'
                      : 'border-gray-200 hover:border-arise-teal/50'
                  }`}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 294
   - Type: button

7. **handlePackageSelect(pkg)}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-arise-gold bg-arise-gold/10'
                      : 'border-gray-200 hover:border-arise-gold/50'
                  }`}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 327
   - Type: button

8. **handleDateSelect(date)}
                      className={`p-3 border-2 rounded-lg text-sm ${
                        isSelected
                          ? 'border-arise-teal bg-arise-teal text-white'
                          : 'border-gray-200 hover:border-arise-teal/50'
                      }`}
                    >
                      {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 373
   - Type: button

9. **handleTimeSelect(slotTime)}
                          disabled={!slot.available}
                          className={`p-3 border-2 rounded-lg text-sm ${
                            !slot.available
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isSelected
                              ? 'border-arise-teal bg-arise-teal text-white'
                              : 'border-gray-200 hover:border-arise-teal/50'
                          }`}
                        >
                          {slotTime}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 402
   - Type: button

10. **{
                                setShowImportInstructions(true);
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\page.tsx`
   - Ligne: 627
   - Type: button

11. **{
                                try {
                                  await reseauContactsAPI.downloadTemplate();
                                  setShowActionsMenu(false);
                                } catch (err) {
                                  const appError = handleApiError(err);
                                  showToast({
                                    message: appError.message || 'Erreur lors du téléchargement du modèle',
                                    type: 'error',
                                  });
                                }
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted border-t border-border"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\page.tsx`
   - Ligne: 637
   - Type: button

12. **{
                                try {
                                  await reseauContactsAPI.downloadZipTemplate();
                                  setShowActionsMenu(false);
                                  showToast({
                                    message: 'Modèle ZIP téléchargé avec succès',
                                    type: 'success',
                                  });
                                } catch (err) {
                                  const appError = handleApiError(err);
                                  showToast({
                                    message: appError.message || 'Erreur lors du téléchargement du modèle ZIP',
                                    type: 'error',
                                  });
                                }
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted border-t border-border"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\page.tsx`
   - Ligne: 655
   - Type: button

13. **{
                                handleExport();
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\page.tsx`
   - Ligne: 697
   - Type: button

14. **{
                                handleDeleteAll();
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 border-t border-border"
                              disabled={loading || contacts.length === 0}
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\page.tsx`
   - Ligne: 707
   - Type: button

15. **{
                                setShowImportInstructions(true);
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\page.tsx`
   - Ligne: 537
   - Type: button

16. **{
                                try {
                                  await companiesAPI.downloadTemplate();
                                  setShowActionsMenu(false);
                                } catch (err) {
                                  const appError = handleApiError(err);
                                  showToast({
                                    message: appError.message || 'Erreur lors du téléchargement du modèle',
                                    type: 'error',
                                  });
                                }
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted border-t border-border"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\page.tsx`
   - Ligne: 547
   - Type: button

17. **{
                                try {
                                  await companiesAPI.downloadZipTemplate();
                                  setShowActionsMenu(false);
                                  showToast({
                                    message: 'Modèle ZIP téléchargé avec succès',
                                    type: 'success',
                                  });
                                } catch (err) {
                                  const appError = handleApiError(err);
                                  showToast({
                                    message: appError.message || 'Erreur lors du téléchargement du modèle ZIP',
                                    type: 'error',
                                  });
                                }
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted border-t border-border"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\page.tsx`
   - Ligne: 565
   - Type: button

18. **{
                                handleExport();
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\page.tsx`
   - Ligne: 607
   - Type: button

19. **{
                                handleDeleteAll();
                                setShowActionsMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 border-t border-border"
                              disabled={loading || companies.length === 0}
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\page.tsx`
   - Ligne: 617
   - Type: button

20. **handleToggle('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-arise-teal' : 'bg-gray-300'
                  }`}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\settings\page.tsx`
   - Ligne: 64
   - Type: button

21. **handleToggle('weeklyProgressReport')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.weeklyProgressReport ? 'bg-arise-teal' : 'bg-gray-300'
                  }`}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\settings\page.tsx`
   - Ligne: 83
   - Type: button

22. **handleToggle('dataSharing')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.dataSharing ? 'bg-arise-teal' : 'bg-gray-300'
                  }`}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\settings\page.tsx`
   - Ligne: 141
   - Type: button

23. **handleToggle('analyticsTracking')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.analyticsTracking ? 'bg-arise-teal' : 'bg-gray-300'
                  }`}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\settings\page.tsx`
   - Ligne: 160
   - Type: button

24. **handleToggle('twoFactorAuth')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.twoFactorAuth ? 'bg-arise-teal' : 'bg-gray-300'
                  }`}
                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\settings\page.tsx`
   - Ligne: 189
   - Type: button

---

## 🔲 BOUTONS AVEC SEULEMENT BORDER

**Total: 141**

### Variant: `border-only` (1)

1. **onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-border'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            {tab.label}**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeTabs.tsx`
   - Ligne: 29
   - Type: button

### Variant: `outline` (140)

1. **handleResendInvitation(invitation.id)}>
                            Réenvoyer**
   - Fichier: `apps\web\src\app\admin\invitations\page.tsx`
   - Ligne: 308
   - Type: Button

2. **handleCancelInvitation(invitation.id)}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            Annuler**
   - Fichier: `apps\web\src\app\admin\invitations\page.tsx`
   - Ligne: 311
   - Type: Button

3. **{
                setShowCreateModal(false);
                setNewInvitationEmail('');
                setNewInvitationRole('user');
              }}
            >
              Annuler**
   - Fichier: `apps\web\src\app\admin\invitations\page.tsx`
   - Ligne: 342
   - Type: Button

4. **Modifier**
   - Fichier: `apps\web\src\app\admin\rbac\page.tsx`
   - Ligne: 204
   - Type: Button

5. **{
                setShowCreateModal(false);
                setNewRoleName('');
                setNewRoleDescription('');
              }}
            >
              Annuler**
   - Fichier: `apps\web\src\app\admin\rbac\page.tsx`
   - Ligne: 270
   - Type: Button

6. **Modifier**
   - Fichier: `apps\web\src\app\admin\teams\page.tsx`
   - Ligne: 245
   - Type: Button

7. **Supprimer**
   - Fichier: `apps\web\src\app\admin\teams\page.tsx`
   - Ligne: 248
   - Type: Button

8. **{
                setShowCreateModal(false);
                setNewTeamName('');
                setNewTeamDescription('');
              }}
            >
              Annuler**
   - Fichier: `apps\web\src\app\admin\teams\page.tsx`
   - Ligne: 306
   - Type: Button

9. **{checkingStatus ? 'Vérification...' : 'Vérifier'}**
   - Fichier: `apps\web\src\app\dashboard\become-superadmin\page.tsx`
   - Ligne: 288
   - Type: Button

10. **{
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Annuler**
   - Fichier: `apps\web\src\app\dashboard\projects\page.tsx`
   - Ligne: 300
   - Type: Button

11. **{
                  setShowEditModal(false);
                  setSelectedProject(null);
                  resetForm();
                }}
              >
                Annuler**
   - Fichier: `apps\web\src\app\dashboard\projects\page.tsx`
   - Ligne: 368
   - Type: Button

12. **(sans texte)**
   - Fichier: `apps\web\src\app\examples\dashboard\page.tsx`
   - Ligne: 108
   - Type: Button

13. **(sans texte)**
   - Fichier: `apps\web\src\app\examples\dashboard\page.tsx`
   - Ligne: 112
   - Type: Button

14. **(sans texte)**
   - Fichier: `apps\web\src\app\examples\dashboard\page.tsx`
   - Ligne: 116
   - Type: Button

15. **(sans texte)**
   - Fichier: `apps\web\src\app\examples\dashboard\page.tsx`
   - Ligne: 120
   - Type: Button

16. **Actualiser**
   - Fichier: `apps\web\src\app\[locale]\admin\api-keys\AdminAPIKeysContent.tsx`
   - Ligne: 249
   - Type: Button

17. **Actualiser**
   - Fichier: `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
   - Ligne: 198
   - Type: Button

18. **{
                setDeleteModalOpen(false);
                setSelectedArticle(null);
              }}
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
   - Ligne: 237
   - Type: Button

19. **handleResendInvitation(invitation.id)} className="text-xs sm:text-sm">
                Réenvoyer**
   - Fichier: `apps\web\src\app\[locale]\admin\invitations\page.tsx`
   - Ligne: 258
   - Type: Button

20. **handleCancelInvitation(invitation.id)}
                className="border-danger-500 text-danger-600 hover:bg-danger-50 text-xs sm:text-sm"
              >
                Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\invitations\page.tsx`
   - Ligne: 261
   - Type: Button

21. **{
                setShowCreateModal(false);
                setNewInvitationEmail('');
                setNewInvitationRole('user');
              }}
              className="flex-1 sm:flex-initial"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\invitations\page.tsx`
   - Ligne: 364
   - Type: Button

22. **Refresh**
   - Fichier: `apps\web\src\app\[locale]\admin\media\AdminMediaContent.tsx`
   - Ligne: 221
   - Type: Button

23. **{
                setDeleteModalOpen(false);
                setSelectedMedia(null);
              }}
            >
              Cancel**
   - Fichier: `apps\web\src\app\[locale]\admin\media\AdminMediaContent.tsx`
   - Ligne: 260
   - Type: Button

24. **openViewModal(team)}
            title="Voir les détails"
            className="min-w-[44px] min-h-[44px] p-2"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\organizations\AdminOrganizationsContent.tsx`
   - Ligne: 423
   - Type: Button

25. **openEditModal(team)}
            title="Modifier"
            className="min-w-[44px] min-h-[44px] p-2"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\organizations\AdminOrganizationsContent.tsx`
   - Ligne: 432
   - Type: Button

26. **handleDeleteTeam(team)}
            title="Supprimer"
            className="min-w-[44px] min-h-[44px] p-2"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\organizations\AdminOrganizationsContent.tsx`
   - Ligne: 441
   - Type: Button

27. **{
                setShowCreateModal(false);
                resetForm();
              }}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\organizations\AdminOrganizationsContent.tsx`
   - Ligne: 520
   - Type: Button

28. **{
                setShowEditModal(false);
                setEditingTeam(null);
                resetForm();
              }}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\organizations\AdminOrganizationsContent.tsx`
   - Ligne: 577
   - Type: Button

29. **{
                setShowViewModal(false);
                setSelectedTeam(null);
              }}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Fermer**
   - Fichier: `apps\web\src\app\[locale]\admin\organizations\AdminOrganizationsContent.tsx`
   - Ligne: 636
   - Type: Button

30. **Actualiser**
   - Fichier: `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
   - Ligne: 197
   - Type: Button

31. **{
                setDeleteModalOpen(false);
                setSelectedPage(null);
              }}
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
   - Ligne: 236
   - Type: Button

32. **handleCancel(plan.id)}
                          className="flex flex-row items-center gap-2"
                        >**
   - Fichier: `apps\web\src\app\[locale]\admin\plans\page.tsx`
   - Ligne: 345
   - Type: Button

33. **handleEdit(plan)}
                        className="flex flex-row items-center gap-2"
                      >**
   - Fichier: `apps\web\src\app\[locale]\admin\plans\page.tsx`
   - Ligne: 356
   - Type: Button

34. **{
                setShowCreateModal(false);
                setNewPlan({
                  name: '',
                  description: '',
                  amount: '',
                  currency: 'eur',
                  interval: 'MONTH',
                  interval_count: 1,
                  is_popular: false,
                  features: '',
                });
                setError(null);
              }}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\plans\page.tsx`
   - Ligne: 535
   - Type: Button

35. **setShowEditModal(true)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            Modifier**
   - Fichier: `apps\web\src\app\[locale]\admin\rbac\page.tsx`
   - Ligne: 215
   - Type: Button

36. **setShowDeleteModal(true)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            Supprimer**
   - Fichier: `apps\web\src\app\[locale]\admin\rbac\page.tsx`
   - Ligne: 223
   - Type: Button

37. **{
                  setShowDeleteModal(false);
                  setError(null);
                }}
                disabled={deleting}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\rbac\page.tsx`
   - Ligne: 307
   - Type: Button

38. **Modifier**
   - Fichier: `apps\web\src\app\[locale]\admin\teams\page.tsx`
   - Ligne: 251
   - Type: Button

39. **Supprimer**
   - Fichier: `apps\web\src\app\[locale]\admin\teams\page.tsx`
   - Ligne: 254
   - Type: Button

40. **{
                setShowCreateModal(false);
                setNewTeamName('');
                setNewTeamDescription('');
              }}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\teams\page.tsx`
   - Ligne: 312
   - Type: Button

41. **{t('reload') || 'Reload'}**
   - Fichier: `apps\web\src\app\[locale]\admin\tenancy\TenancyContent.tsx`
   - Ligne: 245
   - Type: Button

42. **Outline**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeLivePreview.tsx`
   - Ligne: 42
   - Type: Button

43. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\JSONEditor.tsx`
   - Ligne: 223
   - Type: Button

44. **Réinitialiser**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\JSONEditor.tsx`
   - Ligne: 227
   - Type: Button

45. **Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeActions.tsx`
   - Ligne: 160
   - Type: Button

46. **Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeActions.tsx`
   - Ligne: 226
   - Type: Button

47. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeEditor.tsx`
   - Ligne: 290
   - Type: Button

48. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeEditor.tsx`
   - Ligne: 316
   - Type: Button

49. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeEditor.tsx`
   - Ligne: 358
   - Type: Button

50. **Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeEditor.tsx`
   - Ligne: 369
   - Type: Button

51. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeListItem.tsx`
   - Ligne: 81
   - Type: Button

52. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemeListItem.tsx`
   - Ligne: 91
   - Type: Button

53. **Bouton Outline**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemePreview.tsx`
   - Ligne: 110
   - Type: Button

54. **{
              setSelectedUser(row);
              setRolesModalOpen(true);
            }}
            className="text-xs sm:text-sm"
          >
            Rôles**
   - Fichier: `apps\web\src\app\[locale]\admin\users\AdminUsersContent.tsx`
   - Ligne: 133
   - Type: Button

55. **{
              setSelectedUser(row);
              setPermissionsModalOpen(true);
            }}
            className="text-xs sm:text-sm"
          >
            Permissions**
   - Fichier: `apps\web\src\app\[locale]\admin\users\AdminUsersContent.tsx`
   - Ligne: 144
   - Type: Button

56. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 523
   - Type: Button

57. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 533
   - Type: Button

58. **{
                          // View assessment details
                        }}
                        className="flex items-center gap-2"
                      >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 687
   - Type: Button

59. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 734
   - Type: Button

60. **handleEditQuestion(question)}
                              title="Modifier"
                              className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 836
   - Type: Button

61. **handleDeleteQuestion(question.question_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Supprimer"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 845
   - Type: Button

62. **handleEditQuestion(question)}
                              title="Modifier"
                              className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 900
   - Type: Button

63. **handleDeleteQuestion(question.question_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Supprimer"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 909
   - Type: Button

64. **handleEditQuestion(question)}
                              title="Modifier"
                              className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 953
   - Type: Button

65. **handleDeleteQuestion(question.question_id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Supprimer"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 962
   - Type: Button

66. **{
                  setQuestionEditModalOpen(false);
                  setEditingQuestion(null);
                }}
              >
                Annuler**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 1155
   - Type: Button

67. **handleEditRule(pillar)}
                                title="Modifier"
                                className="hover:bg-success-50 dark:hover:bg-success-900/20"
                              >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 1276
   - Type: Button

68. **handleEditRule(capability)}
                                  title="Modifier"
                                  className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 1422
   - Type: Button

69. **{
                  setRuleEditModalOpen(false);
                  setEditingRule(null);
                }}
              >
                Annuler**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
   - Ligne: 1501
   - Type: Button

70. **setSelectedUserIds(new Set())}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Tout désélectionner**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 281
   - Type: Button

71. **setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-sm"
                  >
                    Précédent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 489
   - Type: Button

72. **setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-xs sm:text-sm"
                  >
                    Suivant**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 522
   - Type: Button

73. **{
                setDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              disabled={deleting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 549
   - Type: Button

74. **{
                setBulkDeleteModalOpen(false);
              }}
              disabled={bulkDeleting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 599
   - Type: Button

75. **{
                setSuperAdminModalOpen(false);
                setSelectedUser(null);
              }}
              disabled={makingSuperAdmin}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Annuler**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 648
   - Type: Button

76. **router.push('/dashboard/assessments')}
                className="flex-1 flex align-center gap-8"
              >
                Back to Assessments**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\page.tsx`
   - Ligne: 224
   - Type: Button

77. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\page.tsx`
   - Ligne: 378
   - Type: Button

78. **router.push('/dashboard/assessments')}
            className="mb-4 border-white text-white hover:bg-white/10 flex align-center gap-8"
          >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\results\page.tsx`
   - Ligne: 344
   - Type: Button

79. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\results\page.tsx`
   - Ligne: 385
   - Type: Button

80. **{
                    const idToUse = parseInt(assessmentId || '') || resolvedAssessmentId;
                    if (idToUse) {
                      loadExistingEvaluators(idToUse);
                    }
                  }}
                  disabled={isLoadingEvaluators}
                >
                  {isLoadingEvaluators ? 'Loading...' : 'Refresh'}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\start\page.tsx`
   - Ligne: 301
   - Type: Button

81. **copyToClipboard(link, evaluator.invitation_token)}
                            className="flex items-center gap-2"
                          >
                            {isCopied ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\start\page.tsx`
   - Ligne: 362
   - Type: Button

82. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\start\page.tsx`
   - Ligne: 513
   - Type: Button

83. **router.push('/dashboard/assessments')}
                    disabled={isSubmitting}
                    style={{ 
                      border: '1px solid #D8B868',
                      color: '#D8B868',
                      padding: '6px 12px'
                    }}
                  >
                    Cancel**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\start\page.tsx`
   - Ligne: 531
   - Type: Button

84. **{isSubmitting ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\start\page.tsx`
   - Ligne: 544
   - Type: Button

85. **setShowUploadOption(true)}
                    className="w-full flex items-center justify-center gap-2"
                  >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\page.tsx`
   - Ligne: 108
   - Type: Button

86. **router.push('/dashboard/assessments')}
                    className="w-full"
                  >
                    Back to Assessments**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\results\page.tsx`
   - Ligne: 147
   - Type: Button

87. **router.push('/dashboard/assessments')}>
                  Back to Assessments**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\results\page.tsx`
   - Ligne: 175
   - Type: Button

88. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\results\page.tsx`
   - Ligne: 227
   - Type: Button

89. **router.push('/dashboard/assessments/wellness')}
                  >
                    Try Wellness Assessment**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\results\page.tsx`
   - Ligne: 465
   - Type: Button

90. **router.push('/dashboard/assessments/mbti')}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Cancel**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\upload\page.tsx`
   - Ligne: 426
   - Type: Button

91. **) => e.currentTarget.style.backgroundColor = 'rgba(15, 69, 77, 0.9)'}
            onMouseLeave={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 890
   - Type: Button

92. **{
              if (assessment.externalLink) {
                window.open(assessment.externalLink, '_blank');
              } else {
                // If no external link, redirect to internal MBTI page
                router.push('/dashboard/assessments/mbti');
              }
            }}
          size="sm"
          >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 909
   - Type: Button

93. **{
              router.push('/dashboard/assessments/mbti/upload');
            }}
          >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 925
   - Type: Button

94. **e.currentTarget.style.backgroundColor = 'rgba(15, 69, 77, 0.9)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F454D'}
          disabled={isStarting && !isAlreadyCompleted}
          onClick={async () => {
            if (isAlreadyCompleted) {
              // Already completed, redirect directly
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${safeAssessmentId}`);
              }
              return;
            }
            
            // Not yet completed, submit first then redirect
            try {
              setStartingAssessment(assessment.assessmentType);
              await submitAssessment(safeAssessmentId);
              // Refresh assessments list to update status
              loadAssessments().catch(err => {
                console.error('Failed to refresh assessments after submission:', err);
                // Continue anyway
              });
              // Then redirect to results
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${safeAssessmentId}`);
              }
            } catch (err) {
              console.error('Failed to submit assessment:', err);
              // If submission fails, try to go to results anyway (might already be submitted)
              if (assessment.assessmentType === 'TKI') {
                router.push(`/dashboard/assessments/tki/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'WELLNESS') {
                router.push(`/dashboard/assessments/results?id=${safeAssessmentId}`);
              } else if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
                router.push(`/dashboard/assessments/360-feedback/results?id=${safeAssessmentId}`);
              }
            } finally {
              setStartingAssessment(null);
            }
          }}
        >
          {isStarting && !isAlreadyCompleted ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 946
   - Type: Button

95. **{
            // For 360 assessments, always redirect to the assessment page
            if (assessment.assessmentType === 'THREE_SIXTY_SELF' && safeAssessmentId) {
              router.push(`/dashboard/assessments/360-feedback?assessmentId=${safeAssessmentId}`);
            } else if (assessment.requiresEvaluators && safeAssessmentId) {
              // Other assessments that require evaluators and have an assessmentId - open modal
              setStartingAssessment(null); // Reset loading state when opening modal
              setShowEvaluatorModal(true);
            } else {
              // For other assessment types
              if (assessment.assessmentType === 'WELLNESS') {
                router.push(safeAssessmentId ? `/dashboard/assessments/wellness?assessmentId=${safeAssessmentId}` : '/dashboard/assessments/wellness');
              } else if (assessment.assessmentType === 'TKI') {
                router.push(safeAssessmentId ? `/dashboard/assessments/tki?assessmentId=${safeAssessmentId}` : '/dashboard/assessments/tki');
              } else {
                const route = getAssessmentRoute(assessment.assessmentType);
                router.push(safeAssessmentId ? `/dashboard/assessments/${route}?assessmentId=${safeAssessmentId}` : `/dashboard/assessments/${route}`);
              }
            }
          }}
        >
          {isStarting ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1013
   - Type: Button

96. **{
          try {
            setStartingAssessment(assessment.assessmentType);
            // For 360 assessments, always redirect to start page if no assessmentId exists
            if (assessment.assessmentType === 'THREE_SIXTY_SELF') {
              if (safeAssessmentId) {
                // Existing assessment - resume it
                router.push(`/dashboard/assessments/360-feedback?assessmentId=${safeAssessmentId}`);
              } else {
                // New assessment - redirect to start page to invite evaluators
                router.push('/dashboard/assessments/360-feedback/start');
              }
            } else if (assessment.requiresEvaluators && safeAssessmentId) {
              // Other assessments that require evaluators and have an assessmentId
              setStartingAssessment(null); // Reset loading state when opening modal
              setShowEvaluatorModal(true);
            } else {
              // For other assessment types
              await handleStartAssessment(assessment.assessmentType, safeAssessmentId);
            }
          } catch (err) {
            const errorMessage = formatError(err);
            console.error('Failed to start assessment:', errorMessage);
            setError(errorMessage);
          } finally {
            if (assessment.assessmentType !== 'THREE_SIXTY_SELF' && !(assessment.requiresEvaluators && safeAssessmentId)) {
              setStartingAssessment(null);
            }
          }
        }}
      >
        {isStarting ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1052
   - Type: Button

97. **{
                // Clear cache and reload
                if (typeof window !== 'undefined') {
                  try {
                    sessionStorage.removeItem('assessments_cache');
                  } catch (e) {
                    // Ignore
                  }
                }
                loadAssessments();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs"
              style={{ border: 'none', padding: '2px 4px' }}
            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1212
   - Type: Button

98. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1559
   - Type: Button

99. **{
                            // Clear cache and reload
                            if (typeof window !== 'undefined') {
                              sessionStorage.removeItem('assessments_cache');
                              window.location.reload();
                            }
                          }}
                        >
                          Rafraîchir**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
   - Ligne: 1631
   - Type: Button

100. **router.push('/dashboard/assessments')}
              className="mb-4 flex align-center gap-8"
            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\results\page.tsx`
   - Ligne: 369
   - Type: Button

101. **{isDownloading ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\results\page.tsx`
   - Ligne: 398
   - Type: Button

102. **router.push('/dashboard')}
                >
                  Back to Dashboard**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\results\page.tsx`
   - Ligne: 618
   - Type: Button

103. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\tki\page.tsx`
   - Ligne: 471
   - Type: Button

104. **router.push('/dashboard')}
                    style={{ borderColor: '#0F4C56', color: '#0F4C56' }}
                  >
                    Go to Dashboard**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 426
   - Type: Button

105. **View All Assessments**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 448
   - Type: Button

106. **router.push('/dashboard/assessments')} className="flex align-center gap-8">
              Back to Assessments**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 482
   - Type: Button

107. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
   - Ligne: 616
   - Type: Button

108. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\results\page.tsx`
   - Ligne: 159
   - Type: Button

109. **router.push('/dashboard/assessments/360-feedback')}
                  >
                    Try 360° Feedback**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\results\page.tsx`
   - Ligne: 283
   - Type: Button

110. **{checkingStatus ? 'Vérification...' : 'Vérifier'}**
   - Fichier: `apps\web\src\app\[locale]\dashboard\become-superadmin\page.tsx`
   - Ligne: 291
   - Type: Button

111. **navigateMonth('prev')}
                  >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\agenda\page.tsx`
   - Ligne: 292
   - Type: Button

112. **navigateMonth('next')}
                  >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\agenda\page.tsx`
   - Ligne: 302
   - Type: Button

113. **handleViewDetails(coachee.id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\coachee\page.tsx`
   - Ligne: 289
   - Type: Button

114. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\coachee\page.tsx`
   - Ligne: 298
   - Type: Button

115. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coach\coachee\page.tsx`
   - Ligne: 306
   - Type: Button

116. **setStep('coach')}>
                Retour**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 350
   - Type: Button

117. **setStep('package')}>
                Retour**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 439
   - Type: Button

118. **setStep('datetime')}>
                Retour**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 489
   - Type: Button

119. **router.push('/contact')}
                >
                  Nous contacter**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\page.tsx`
   - Ligne: 504
   - Type: Button

120. **router.push('/dashboard')}
            >
              Retour au dashboard**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\success\page.tsx`
   - Ligne: 45
   - Type: Button

121. **router.push('/dashboard')}
              size="sm"
              className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white text-xs"
              style={{ border: 'none', color: '#FFFFFF', padding: '4px 8px' }}
            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
   - Ligne: 649
   - Type: Button

122. **loadEvaluators()}
              size="sm"
              className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white disabled:text-white/50 text-xs"
              style={{ border: 'none', color: '#FFFFFF', padding: '4px 8px' }}
              disabled={isLoading}
            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
   - Ligne: 659
   - Type: Button

123. **copyInvitationLink(evaluator.invitation_token)}
                              className="text-xs flex flex-row items-center gap-2"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
   - Ligne: 865
   - Type: Button

124. **handleDelete(evaluator.id, evaluator.name)}
                          disabled={deletingId === evaluator.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === evaluator.id ? (**
   - Fichier: `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
   - Ligne: 881
   - Type: Button

125. **{
            e.currentTarget.style.backgroundColor = 'rgba(15, 68, 76, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => {
            if (evaluation.assessmentType === 'TKI' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/tki/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'WELLNESS' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'THREE_SIXTY_SELF' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/360-feedback/results?id=${evaluation.assessmentId}`);
            } else if (evaluation.assessmentType === 'MBTI' && evaluation.assessmentId) {
              router.push(`/dashboard/assessments/mbti/results?id=${evaluation.assessmentId}`);
            }
          }}
        >
          View Results**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 312
   - Type: Button

126. **) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 68, 76, 0.1)';
          }}
          onMouseLeave={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 346
   - Type: Button

127. **{
            router.push(`/dashboard/assessments/${getAssessmentRoute(evaluation.assessmentType)}`);
          }}
        >
          Continue**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 395
   - Type: Button

128. **) => {
                                e.currentTarget.style.backgroundColor = 'rgba(15, 68, 76, 0.1)';
                              }}
                              onMouseLeave={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 498
   - Type: Button

129. **) => {
                        e.currentTarget.style.backgroundColor = 'rgba(121, 155, 161, 0.1)';
                      }}
                      onMouseLeave={(e: React.MouseEvent**
   - Fichier: `apps\web\src\app\[locale]\dashboard\page.tsx`
   - Ligne: 596
   - Type: Button

130. **setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Annuler**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 577
   - Type: Button

131. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 671
   - Type: Button

132. **setShowActionsMenu(!showActionsMenu)}
                      className="text-xs px-2 py-1.5 h-auto"
                      aria-label="Actions"
                    >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\page.tsx`
   - Ligne: 610
   - Type: Button

133. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\[id]\edit\page.tsx`
   - Ligne: 113
   - Type: Button

134. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\[id]\edit\page.tsx`
   - Ligne: 136
   - Type: Button

135. **{
            const locale = params?.locale as string || 'en';
            router.push(`/${locale}/dashboard/reseau/contacts`);
          }}>**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\[id]\page.tsx`
   - Ligne: 113
   - Type: Button

136. **{
            const locale = params?.locale as string || 'en';
            router.push(`/${locale}/dashboard/reseau/contacts`);
          }}>**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\[id]\page.tsx`
   - Ligne: 139
   - Type: Button

137. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\contacts\[id]\page.tsx`
   - Ligne: 167
   - Type: Button

138. **setShowActionsMenu(!showActionsMenu)}
                      className="text-xs px-2 py-1.5 h-auto"
                      aria-label="Actions"
                    >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\page.tsx`
   - Ligne: 520
   - Type: Button

139. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\[id]\page.tsx`
   - Ligne: 116
   - Type: Button

140. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reseau\entreprises\[id]\page.tsx`
   - Ligne: 143
   - Type: Button

---

## 👻 BOUTONS GHOST (SANS BORDER NI BACKGROUND)

**Total: 34**

1. **Retirer**
   - Fichier: `apps\web\src\app\admin\teams\page.tsx`
   - Ligne: 273
   - Type: Button

2. **{
              setDeleteModalOpen(false);
              setSelectedUser(null);
            }}
          >
            Annuler**
   - Fichier: `apps\web\src\app\admin\users\AdminUsersContent.tsx`
   - Ligne: 204
   - Type: Button

3. **setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >**
   - Fichier: `apps\web\src\app\dashboard\layout.tsx`
   - Ligne: 86
   - Type: Button

4. **{
                    const homePath = locale === 'en' ? '/' : `/${locale}`;
                    router.push(homePath);
                  }}
                  aria-label="Retour à l'accueil"
                  title="Retour à l'accueil"
                >**
   - Fichier: `apps\web\src\app\dashboard\layout.tsx`
   - Ligne: 158
   - Type: Button

5. **openEditModal(row)}
            className="p-2"
            title="Modifier"
          >**
   - Fichier: `apps\web\src\app\dashboard\projects\page.tsx`
   - Ligne: 217
   - Type: Button

6. **handleDeleteProject(row.id)}
            className="p-2 text-red-600 hover:text-red-700"
            title="Supprimer"
          >**
   - Fichier: `apps\web\src\app\dashboard\projects\page.tsx`
   - Ligne: 226
   - Type: Button

7. **{
              setSelectedKey(key);
              setDeleteModalOpen(true);
            }}
            disabled={!key.is_active}
            className="min-w-[44px] min-h-[44px] p-2"
            title="Révoquer la clé"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\api-keys\AdminAPIKeysContent.tsx`
   - Ligne: 183
   - Type: Button

8. **{
                  setDeleteModalOpen(false);
                  setSelectedKey(null);
                }}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\api-keys\AdminAPIKeysContent.tsx`
   - Ligne: 299
   - Type: Button

9. **handleView(article)}
            aria-label="Voir l'article"
            title="Voir l'article"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
   - Ligne: 131
   - Type: Button

10. **handleEdit(article)}
            aria-label="Modifier l'article"
            title="Modifier l'article"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
   - Ligne: 140
   - Type: Button

11. **{
              setSelectedArticle(article);
              setDeleteModalOpen(true);
            }}
            aria-label="Supprimer l'article"
            title="Supprimer l'article"
            className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
   - Ligne: 149
   - Type: Button

12. **{
              setSelectedMedia(media);
              setDeleteModalOpen(true);
            }}
            aria-label="Delete file"
            title="Delete file"
            className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\media\AdminMediaContent.tsx`
   - Ligne: 160
   - Type: Button

13. **handleView(page)}
            aria-label="Voir la page"
            title="Voir la page"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
   - Ligne: 130
   - Type: Button

14. **handleEdit(page)}
            aria-label="Modifier la page"
            title="Modifier la page"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
   - Ligne: 139
   - Type: Button

15. **{
              setSelectedPage(page);
              setDeleteModalOpen(true);
            }}
            aria-label="Supprimer la page"
            title="Supprimer la page"
            className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
          >**
   - Fichier: `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
   - Ligne: 148
   - Type: Button

16. **Retirer**
   - Fichier: `apps\web\src\app\[locale]\admin\teams\page.tsx`
   - Ligne: 279
   - Type: Button

17. **Ghost**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeLivePreview.tsx`
   - Ligne: 44
   - Type: Button

18. **Bouton Ghost**
   - Fichier: `apps\web\src\app\[locale]\admin\themes\components\ThemePreview.tsx`
   - Ligne: 111
   - Type: Button

19. **{
              setDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            Annuler**
   - Fichier: `apps\web\src\app\[locale]\admin\users\AdminUsersContent.tsx`
   - Ligne: 276
   - Type: Button

20. **{
                                // View user details - can be implemented later
                              }}
                              title="Voir les détails"
                              className="min-w-[44px] min-h-[44px] p-2"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 427
   - Type: Button

21. **{
                                // Edit user - can be implemented later
                              }}
                              title="Modifier"
                              className="min-w-[44px] min-h-[44px] p-2"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 438
   - Type: Button

22. **{
                                setSelectedUser(user);
                                setSuperAdminModalOpen(true);
                              }}
                              title="Rendre superadmin"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 min-w-[44px] min-h-[44px] p-2"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 449
   - Type: Button

23. **{
                                setSelectedUser(user);
                                setDeleteModalOpen(true);
                              }}
                              title="Supprimer"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[44px] min-h-[44px] p-2"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
   - Ligne: 461
   - Type: Button

24. **router.push('/dashboard/assessments')}
            className="mb-6"
          >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\page.tsx`
   - Ligne: 32
   - Type: Button

25. **router.push('/dashboard/assessments')}
              className="mb-4 flex align-center gap-8"
            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\results\page.tsx`
   - Ligne: 205
   - Type: Button

26. **router.push('/dashboard/assessments/mbti')}
            className="mb-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center gap-8"
            disabled={isUploading}
          >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\mbti\upload\page.tsx`
   - Ligne: 200
   - Type: Button

27. **router.push('/dashboard/assessments')}
              className="mb-4 flex align-center gap-8"
            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\assessments\wellness\results\page.tsx`
   - Ligne: 141
   - Type: Button

28. **router.back()}
          className="mb-6"
        >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
   - Ligne: 235
   - Type: Button

29. **router.push('/dashboard/development-plan')}
            className="mb-6"
          >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\development-plan\resources\[id]\page.tsx`
   - Ligne: 341
   - Type: Button

30. **router.push('/dashboard/development-plan')}
          className="mb-6 text-white hover:bg-white/10"
        >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\development-plan\resources\[id]\page.tsx`
   - Ligne: 394
   - Type: Button

31. **{
                              // View user onboarding details
                            }}
                            title="View details"
                          >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\management\onboarding\page.tsx`
   - Ligne: 220
   - Type: Button

32. **{
                                // Reset onboarding
                              }}
                              title="Réinitialiser l'onboarding"
                              className="text-orange-600 hover:text-orange-700"
                            >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\management\onboarding\page.tsx`
   - Ligne: 231
   - Type: Button

33. **handleDownloadAssessment(assessment)}
                          title={`Download ${assessment.name} report`}
                        >**
   - Fichier: `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
   - Ligne: 753
   - Type: Button

34. **(sans texte)**
   - Fichier: `apps\web\src\app\[locale]\dashboard\results\page.tsx`
   - Ligne: 295
   - Type: Button

---

---

## 📁 STATISTIQUES PAR FICHIER

### `apps\web\src\app\[locale]\admin\AdminContent.tsx`
- Total: 9
- Avec background: 9
- Border seulement: 0

### `apps\web\src\app\[locale]\admin\api-keys\AdminAPIKeysContent.tsx`
- Total: 4
- Avec background: 1
- Border seulement: 1
- Ghost: 2

### `apps\web\src\app\[locale]\admin\articles\AdminArticlesContent.tsx`
- Total: 7
- Avec background: 2
- Border seulement: 2
- Ghost: 3

### `apps\web\src\app\[locale]\admin\invitations\page.tsx`
- Total: 3
- Avec background: 0
- Border seulement: 3

### `apps\web\src\app\[locale]\admin\media\AdminMediaContent.tsx`
- Total: 4
- Avec background: 1
- Border seulement: 2
- Ghost: 1

### `apps\web\src\app\[locale]\admin\organizations\AdminOrganizationsContent.tsx`
- Total: 6
- Avec background: 0
- Border seulement: 6

### `apps\web\src\app\[locale]\admin\pages\AdminPagesContent.tsx`
- Total: 7
- Avec background: 2
- Border seulement: 2
- Ghost: 3

### `apps\web\src\app\[locale]\admin\plans\page.tsx`
- Total: 6
- Avec background: 3
- Border seulement: 3

### `apps\web\src\app\[locale]\admin\rbac\page.tsx`
- Total: 4
- Avec background: 1
- Border seulement: 3

### `apps\web\src\app\[locale]\admin\settings\AdminSettingsContent.tsx`
- Total: 1
- Avec background: 1
- Border seulement: 0

### `apps\web\src\app\[locale]\admin\teams\page.tsx`
- Total: 4
- Avec background: 0
- Border seulement: 3
- Ghost: 1

### `apps\web\src\app\[locale]\admin\tenancy\TenancyContent.tsx`
- Total: 2
- Avec background: 1
- Border seulement: 1

### `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeBuilder.tsx`
- Total: 2
- Avec background: 2
- Border seulement: 0

### `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeExportImport.tsx`
- Total: 4
- Avec background: 4
- Border seulement: 0

### `apps\web\src\app\[locale]\admin\themes\builder\components\ThemeLivePreview.tsx`
- Total: 5
- Avec background: 3
- Border seulement: 1
- Ghost: 1

### `apps\web\src\app\[locale]\admin\themes\builder\components\ThemePresets.tsx`
- Total: 1
- Avec background: 1
- Border seulement: 0

### `apps\web\src\app\[locale]\admin\themes\builder\page.tsx`
- Total: 1
- Avec background: 1
- Border seulement: 0

### `apps\web\src\app\[locale]\admin\themes\components\JSONEditor.tsx`
- Total: 2
- Avec background: 0
- Border seulement: 2

### `apps\web\src\app\[locale]\admin\themes\components\ThemeActions.tsx`
- Total: 4
- Avec background: 2
- Border seulement: 2

### `apps\web\src\app\[locale]\admin\themes\components\ThemeEditor.tsx`
- Total: 5
- Avec background: 1
- Border seulement: 4

### `apps\web\src\app\[locale]\admin\themes\components\ThemeList.tsx`
- Total: 3
- Avec background: 3
- Border seulement: 0

### `apps\web\src\app\[locale]\admin\themes\components\ThemeListItem.tsx`
- Total: 4
- Avec background: 2
- Border seulement: 2

### `apps\web\src\app\[locale]\admin\themes\components\ThemePreview.tsx`
- Total: 5
- Avec background: 3
- Border seulement: 1
- Ghost: 1

### `apps\web\src\app\[locale]\admin\themes\components\ThemeTabs.tsx`
- Total: 1
- Avec background: 0
- Border seulement: 1

### `apps\web\src\app\[locale]\admin\users\AdminUsersContent.tsx`
- Total: 5
- Avec background: 2
- Border seulement: 2
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\admin\assessment-management\page.tsx`
- Total: 18
- Avec background: 4
- Border seulement: 14

### `apps\web\src\app\[locale]\dashboard\admin\users\page.tsx`
- Total: 14
- Avec background: 4
- Border seulement: 6
- Ghost: 4

### `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\page.tsx`
- Total: 3
- Avec background: 1
- Border seulement: 2

### `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\results\page.tsx`
- Total: 2
- Avec background: 0
- Border seulement: 2

### `apps\web\src\app\[locale]\dashboard\assessments\360-feedback\start\page.tsx`
- Total: 6
- Avec background: 1
- Border seulement: 5

### `apps\web\src\app\[locale]\dashboard\assessments\mbti\page.tsx`
- Total: 4
- Avec background: 2
- Border seulement: 1
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\assessments\mbti\results\page.tsx`
- Total: 6
- Avec background: 1
- Border seulement: 4
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\assessments\mbti\upload\page.tsx`
- Total: 3
- Avec background: 1
- Border seulement: 1
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\assessments\page.tsx`
- Total: 12
- Avec background: 3
- Border seulement: 9

### `apps\web\src\app\[locale]\dashboard\assessments\results\page.tsx`
- Total: 4
- Avec background: 1
- Border seulement: 3

### `apps\web\src\app\[locale]\dashboard\assessments\tki\page.tsx`
- Total: 3
- Avec background: 2
- Border seulement: 1

### `apps\web\src\app\[locale]\dashboard\assessments\wellness\page.tsx`
- Total: 8
- Avec background: 4
- Border seulement: 4

### `apps\web\src\app\[locale]\dashboard\assessments\wellness\results\page.tsx`
- Total: 3
- Avec background: 0
- Border seulement: 2
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\become-superadmin\page.tsx`
- Total: 3
- Avec background: 2
- Border seulement: 1

### `apps\web\src\app\[locale]\dashboard\coach\agenda\page.tsx`
- Total: 3
- Avec background: 1
- Border seulement: 2

### `apps\web\src\app\[locale]\dashboard\coach\coachee\page.tsx`
- Total: 5
- Avec background: 2
- Border seulement: 3

### `apps\web\src\app\[locale]\dashboard\coaching-options\book\page.tsx`
- Total: 11
- Avec background: 7
- Border seulement: 3
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\coaching-options\page.tsx`
- Total: 3
- Avec background: 2
- Border seulement: 1

### `apps\web\src\app\[locale]\dashboard\coaching-options\success\page.tsx`
- Total: 2
- Avec background: 1
- Border seulement: 1

### `apps\web\src\app\[locale]\dashboard\development-plan\page.tsx`
- Total: 2
- Avec background: 2
- Border seulement: 0

### `apps\web\src\app\[locale]\dashboard\development-plan\resources\[id]\page.tsx`
- Total: 5
- Avec background: 3
- Border seulement: 0
- Ghost: 2

### `apps\web\src\app\[locale]\dashboard\evaluators\page.tsx`
- Total: 7
- Avec background: 3
- Border seulement: 4

### `apps\web\src\app\[locale]\dashboard\management\onboarding\page.tsx`
- Total: 2
- Avec background: 0
- Border seulement: 0
- Ghost: 2

### `apps\web\src\app\[locale]\dashboard\page.tsx`
- Total: 11
- Avec background: 6
- Border seulement: 5

### `apps\web\src\app\[locale]\dashboard\reports\page.tsx`
- Total: 9
- Avec background: 6
- Border seulement: 2
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\reseau\contacts\[id]\edit\page.tsx`
- Total: 2
- Avec background: 0
- Border seulement: 2

### `apps\web\src\app\[locale]\dashboard\reseau\contacts\[id]\page.tsx`
- Total: 3
- Avec background: 0
- Border seulement: 3

### `apps\web\src\app\[locale]\dashboard\reseau\contacts\page.tsx`
- Total: 6
- Avec background: 5
- Border seulement: 1

### `apps\web\src\app\[locale]\dashboard\reseau\entreprises\[id]\page.tsx`
- Total: 2
- Avec background: 0
- Border seulement: 2

### `apps\web\src\app\[locale]\dashboard\reseau\entreprises\page.tsx`
- Total: 6
- Avec background: 5
- Border seulement: 1

### `apps\web\src\app\[locale]\dashboard\results\page.tsx`
- Total: 6
- Avec background: 5
- Border seulement: 0
- Ghost: 1

### `apps\web\src\app\[locale]\dashboard\settings\page.tsx`
- Total: 5
- Avec background: 5
- Border seulement: 0

### `apps\web\src\app\admin\AdminContent.tsx`
- Total: 6
- Avec background: 6
- Border seulement: 0

### `apps\web\src\app\admin\invitations\page.tsx`
- Total: 3
- Avec background: 0
- Border seulement: 3

### `apps\web\src\app\admin\rbac\page.tsx`
- Total: 2
- Avec background: 0
- Border seulement: 2

### `apps\web\src\app\admin\settings\AdminSettingsContent.tsx`
- Total: 1
- Avec background: 1
- Border seulement: 0

### `apps\web\src\app\admin\teams\page.tsx`
- Total: 4
- Avec background: 0
- Border seulement: 3
- Ghost: 1

### `apps\web\src\app\admin\users\AdminUsersContent.tsx`
- Total: 3
- Avec background: 2
- Border seulement: 0
- Ghost: 1

### `apps\web\src\app\dashboard\become-superadmin\page.tsx`
- Total: 3
- Avec background: 2
- Border seulement: 1

### `apps\web\src\app\dashboard\layout.tsx`
- Total: 3
- Avec background: 1
- Border seulement: 0
- Ghost: 2

### `apps\web\src\app\dashboard\projects\page.tsx`
- Total: 4
- Avec background: 0
- Border seulement: 2
- Ghost: 2

### `apps\web\src\app\examples\dashboard\page.tsx`
- Total: 4
- Avec background: 0
- Border seulement: 4

