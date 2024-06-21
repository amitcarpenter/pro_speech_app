import express from "express";
import { upload } from "../services/uploadImage";
import { uploadProfileImage } from "../services/uploadImage";
import { uploadModuleImage } from "../services/uploadImage";
import { uploadSectionImage } from "../services/uploadImage";
import { authenticateUser, isAdmin } from "../middlewares/auth";

//==================================== Import Controller ==============================

import * as userControllers from "../controllers/admin/userController";
import * as sectionController from "../controllers/admin/sectionController";
import * as moduleController from "../controllers/admin/moduleController";
import * as lessonController from "../controllers/admin/lessonController";
import * as quizController from "../controllers/admin/quizController";
import * as privacyPoliciesController from "../controllers/admin/privacyPolicyController";
import * as termsAndConditionsController from "../controllers/admin/termsAndConditionsController";

const router = express.Router();

//==================================== User ==============================
router.get(
  "/get-user-list",
  authenticateUser,
  isAdmin,
  userControllers.get_user_list
);

//==================================== Section ==============================
router.post(
  "/sections",
  authenticateUser,
  isAdmin,
  uploadSectionImage,
  sectionController.createSection
);
router.put(
  "/sections/:id",
  authenticateUser,
  isAdmin,
  uploadSectionImage,
  sectionController.updateSection
);
router.delete(
  "/sections/:id",
  authenticateUser,
  isAdmin,
  sectionController.deleteSection
);

//==================================== Module ==============================
router.post(
  "/modules",
  authenticateUser,
  isAdmin,
  uploadModuleImage,
  moduleController.createModule
);
router.put(
  "/modules/:id",
  authenticateUser,
  isAdmin,
  uploadModuleImage,
  moduleController.updateModuleById
);
router.delete(
  "/modules/:id",
  authenticateUser,
  isAdmin,
  moduleController.deleteModuleById
);

//==================================== Lesson ==============================
router.post(
  "/lessons",
  authenticateUser,
  isAdmin,
  lessonController.createLesson
);
router.put(
  "/lessons/:id",
  authenticateUser,
  isAdmin,
  lessonController.updateLessonById
);
router.delete(
  "/lessons/:id",
  authenticateUser,
  isAdmin,
  lessonController.deleteLessonById
);

//==================================== Quiz ==============================
router.post("/quizzes", authenticateUser, isAdmin, quizController.createQuiz);
router.put(
  "/quizzes/:id",
  authenticateUser,
  isAdmin,
  quizController.updateQuizById
);
router.put(
  "/quizzes/:id",
  authenticateUser,
  isAdmin,
  quizController.updateQuizById
);
router.delete(
  "/quizzes/:id",
  authenticateUser,
  isAdmin,
  quizController.deleteQuizById
);

//==================================== Privacy Policy ==============================
router.post(
  "/privacy-policy/create",
  authenticateUser,
  isAdmin,
  privacyPoliciesController.createPrivacyPolicy
);
router.put(
  "/privacy-policy/",
  authenticateUser,
  isAdmin,
  privacyPoliciesController.updatePrivacyPolicy
);
router.delete(
  "/privacy-policy/:id",
  authenticateUser,
  isAdmin,
  privacyPoliciesController.deletePrivacyPolicy
);

//==================================== Terms & Condition ==============================
router.post(
  "/terms-and-conditions/create",
  authenticateUser,
  isAdmin,
  termsAndConditionsController.createTermsCondition
);
router.put(
  "/terms-and-conditions/",
  authenticateUser,
  isAdmin,
  termsAndConditionsController.updateTermsCondition
);
router.delete(
  "/terms-and-conditions/:id",
  authenticateUser,
  isAdmin,
  termsAndConditionsController.deleteTermsCondition
);

//==================================== Terms & Condition ==============================
router.get(
  "/sidebar",
  authenticateUser,
  isAdmin,
  sectionController.sidebarshow
);

export default router;
