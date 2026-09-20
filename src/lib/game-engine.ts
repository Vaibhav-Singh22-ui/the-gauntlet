import { supabase } from './supabase';
import { GameSession, ActiveQuestionData, AnswerSubmissionResult, AnswerOption } from '@/types/game';

export async function startGame(operatorId?: string): Promise<{ success: boolean; session?: GameSession; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('fn_start_game', {
      p_operator_id: operatorId || null,
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);

    return {
      success: true,
      session: {
        id: data.session_id,
        status: data.status,
        current_level: data.current_level,
        current_reward: data.current_reward,
        lifeline_hint_available: data.lifeline_hint_available,
        lifeline_fifty_fifty_available: data.lifeline_fifty_fifty_available,
        started_at: new Date().toISOString(),
        final_reward: 0,
        final_level: 1,
      },
    };
  } catch (err: any) {
    console.error('Error starting game:', err);
    return { success: false, error: err.message || 'Failed to start game' };
  }
}

export async function spinWheelAndGetQuestion(
  sessionId: string
): Promise<{ success: boolean; question?: ActiveQuestionData; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('fn_spin_and_select_question', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);

    return {
      success: true,
      question: {
        session_question_id: data.session_question_id,
        level: data.level,
        selected_color: data.selected_color,
        question_text: data.question_text,
        option_a: data.option_a,
        option_b: data.option_b,
        option_c: data.option_c,
        option_d: data.option_d,
        presented_at: data.presented_at,
        hint_available: data.hint_available,
        fifty_fifty_available: data.fifty_fifty_available,
        current_reward: data.current_reward,
        next_reward: data.next_reward,
      },
    };
  } catch (err: any) {
    console.error('Error spinning wheel & selecting question:', err);
    return { success: false, error: err.message || 'Failed to select question' };
  }
}

export async function submitAnswer(
  sessionId: string,
  sessionQuestionId: string,
  answer: AnswerOption | 'TIMEOUT'
): Promise<AnswerSubmissionResult> {
  try {
    const { data, error } = await supabase.rpc('fn_submit_answer', {
      p_session_id: sessionId,
      p_session_question_id: sessionQuestionId,
      p_answer: answer,
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);

    return {
      success: true,
      result: data.result,
      correct: data.correct,
      is_timeout: data.is_timeout,
      correct_option: data.correct_option,
      status: data.status,
      current_reward: data.current_reward,
      current_level: data.current_level,
    };
  } catch (err: any) {
    console.error('Error submitting answer:', err);
    return {
      success: false,
      result: 'WRONG',
      correct: false,
      is_timeout: false,
      correct_option: 'A',
      status: 'GAME_OVER',
      current_reward: 0,
      current_level: 1,
      error: err.message || 'Failed to submit answer',
    };
  }
}

export async function useHint(
  sessionId: string,
  sessionQuestionId: string
): Promise<{ success: boolean; hintText?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('fn_use_hint', {
      p_session_id: sessionId,
      p_session_question_id: sessionQuestionId,
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);

    return { success: true, hintText: data.hint_text };
  } catch (err: any) {
    console.error('Error using hint:', err);
    return { success: false, error: err.message || 'Failed to activate hint' };
  }
}

export async function useFiftyFifty(
  sessionId: string,
  sessionQuestionId: string
): Promise<{ success: boolean; removedOptions?: AnswerOption[]; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('fn_use_fifty_fifty', {
      p_session_id: sessionId,
      p_session_question_id: sessionQuestionId,
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);

    return { success: true, removedOptions: data.removed_options };
  } catch (err: any) {
    console.error('Error using 50:50:', err);
    return { success: false, error: err.message || 'Failed to activate 50:50' };
  }
}

export async function riskContinue(
  sessionId: string
): Promise<{ success: boolean; newLevel?: number; currentReward?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('fn_risk_continue', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);

    return {
      success: true,
      newLevel: data.current_level,
      currentReward: data.current_reward,
    };
  } catch (err: any) {
    console.error('Error continuing level:', err);
    return { success: false, error: err.message || 'Failed to continue' };
  }
}

export async function cashOut(
  sessionId: string
): Promise<{ success: boolean; finalReward?: number; finalLevel?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('fn_cash_out', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);

    return {
      success: true,
      finalReward: data.final_reward,
      finalLevel: data.final_level,
    };
  } catch (err: any) {
    console.error('Error cashing out:', err);
    return { success: false, error: err.message || 'Failed to cash out' };
  }
}

export async function resetGame(
  sessionId?: string,
  operatorId?: string
): Promise<{ success: boolean; session?: GameSession; error?: string }> {
  return startGame(operatorId);
}

export async function getSessionState(
  sessionId: string
): Promise<{ success: boolean; state?: any; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('fn_get_session_state', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    return { success: true, state: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
