import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

//==================================== middleware ==============================

import { authenticateUser } from "../middlewares/auth";

//==================================== Import Routes ==============================

import user_router from "../routes/userRoutes";
import quizRoutes from "../routes/quizRoutes";
import lessonRoutes from "../routes/lessonRoutes";
import moduleRoutes from "../routes/moduleRoutes";
import sectionRoutes from "../routes/sectionRoutes";
import scoreRoutes from "../routes/scoreRoutes";
import lessonDetailsRoutes from "../routes/lessonDetailsRoutes";
import privacyPolicyRouters from "../routes//privacyPolicyRoutes";
import termsAndConditionsRoutes from "../routes/termsAndConditionsRoutes";


//==================================== configureApp ==============================

const configureApp = (app: Application): void => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors())
  app.use("/api/auth", user_router);
  app.use('/api/quizzes', authenticateUser, quizRoutes);
  app.use('/api/lessons', authenticateUser, lessonRoutes);
  app.use('/api/modules', authenticateUser, moduleRoutes);
  app.use('/api/sections', authenticateUser, sectionRoutes);
  app.use('/api/scores', authenticateUser, scoreRoutes);
  app.use('/api/lessonDetails', authenticateUser, lessonDetailsRoutes);
  app.use('/api/privacy-policy', authenticateUser, privacyPolicyRouters);
  app.use('/api/terms-and-conditions', authenticateUser, termsAndConditionsRoutes);

};


export default configureApp;
