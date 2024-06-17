import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { authenticateUser } from "../middlewares/auth";

import user_router from "../routes/userRoutes";
import quizRoutes from "../routes/quizRoutes";
import lessonRoutes from "../routes/lessonRoutes";
import moduleRoutes from "../routes/moduleRoutes";
import sectionRoutes from "../routes/sectionRoutes";


const configureApp = (app: Application): void => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/api/auth", user_router);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/modules', moduleRoutes);
  app.use('/api/sections', sectionRoutes);
};



export default configureApp;
