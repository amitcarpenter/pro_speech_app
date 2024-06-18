// src/qsmApi.ts

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.QSM_API_KEY;
const baseUrl = process.env.QSM_BASE_URL;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});

export const getQuizInfo = async (quizId: string) => {
  try {
    const response = await axiosInstance.get(`/quiz`, {
      params: { quizId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz info:', error);
    throw error;
  }
};

export const getQuizResultInfo = async (resultId: string) => {
  try {
    const response = await axiosInstance.get(`/quiz_result`, {
      params: { result_id: resultId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz result info:', error);
    throw error;
  }
};

export const getQuizQuestions = async (quizId: string) => {
  try {
    const response = await axiosInstance.get(`/get_questions`, {
      params: { quizId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    throw error;
  }
};

export const submitQuizResults = async (quizId: string, questionList: string, totalQuestions: number, answers: any, timer: number, currentTime: string, currentTimeZone: string) => {
  try {
    const data = {
      qmn_quiz_id: quizId,
      qmn_question_list: questionList,
      total_questions: totalQuestions,
      ...answers,
      timer,
      currentuserTime: currentTime,
      currentuserTimeZone: currentTimeZone
    };

    const response = await axiosInstance.post(`/submitquiz`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz results:', error);
    throw error;
  }
};
