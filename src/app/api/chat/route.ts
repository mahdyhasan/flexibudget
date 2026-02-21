import { NextRequest, NextResponse } from 'next/server';
import { generateEnvironment, chatWithAI } from '@/lib/openai';
import type { BusinessType } from '@/types/budget';

export async function POST(request: NextRequest) {
  try {
    const { messages, businessType, generateEnvironment: shouldGenerate, userResponses } = await request.json();
    
    // Generate complete environment
    if (shouldGenerate && businessType && userResponses) {
      try {
        const environment = await generateEnvironment(businessType, userResponses);
        return NextResponse.json({ success: true, environment });
      } catch (error) {
        console.error('Environment generation error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to generate environment' },
          { status: 500 }
        );
      }
    }
    
    // Regular chat conversation
    if (messages && businessType) {
      try {
        const response = await chatWithAI(messages, businessType);
        return NextResponse.json({ success: true, response });
      } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to process chat' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}