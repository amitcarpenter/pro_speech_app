import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { authenticateUser } from "../middlewares/auth";

import user_router from "../routes/userRoutes";
import quizRoutes from "../routes/quizRoutes";
import lessonRoutes from "../routes/lessonRoutes";
import moduleRoutes from "../routes/moduleRoutes";
import sectionRoutes from "../routes/sectionRoutes";
import scoreRoutes from "../routes/scoreRoutes";
import lessonDetailsRoutes from "../routes/lessonDetailsRoutes";
import privacyPolicyRouters from "../routes//privacyPolicyRoutes";
import termsAndConditionsRoutes from "../routes/termsAndConditionsRoutes";


const configureApp = (app: Application): void => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/api/auth", user_router);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/modules', moduleRoutes);
  app.use('/api/sections', sectionRoutes);
  app.use('/api/scores', scoreRoutes);
  app.use('/api/lessonDetails', lessonDetailsRoutes);
  app.use('/api/privacy-policy', privacyPolicyRouters);
  app.use('/api/terms-and-conditions', termsAndConditionsRoutes);

};



export default configureApp;
