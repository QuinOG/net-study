import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiBookOpen, FiCheckCircle, FiHelpCircle, FiAward, FiChevronDown } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import '../../styles/ui/LessonDetail.css';

/**
 * LessonDetail Component
 * 
 * Renders a lesson with each section (##### heading) as its own tab for better navigation.
 * Separates content into tabs based on markdown headings.
 * Tracks completion status and progress through localStorage.
 */
const LessonDetail = () => {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  // State to hold processed content sections for tabs
  const [sectionTabs, setSectionTabs] = useState([]);

  useEffect(() => {
    /**
     * Fetches lesson content and processes it into section tabs.
     * Also checks localStorage for completion status to maintain user progress.
     */
    const fetchLesson = async () => {
      try {
        // In a real app, this would be an API call to get the lesson
        // For now, we'll try to load the markdown content
        let markdownContent = '';
        
        try {
          // First try loading as a .md file
          const response = await fetch(`/modules/module${moduleId}_lesson${lessonId}.md`);
          if (response.ok) {
            markdownContent = await response.text();
          } else {
            throw new Error('Markdown file not found');
          }
        } catch (err) {
          // If .md file not found, try without extension (some files might not have .md)
          const fallbackResponse = await fetch(`/modules/module${moduleId}_lesson${lessonId}`);
          if (fallbackResponse.ok) {
            markdownContent = await fallbackResponse.text();
          } else {
            throw new Error('Lesson content not found');
          }
        }
        
        if (markdownContent) {
          // Extract sections with ##### headings for tabs
          const sections = extractSections(markdownContent);
          setSectionTabs(sections);
          
          setLesson({
            id: `lesson${moduleId}_${lessonId}`,
            title: extractTitle(markdownContent),
            content: markdownContent,
            duration: extractDuration(markdownContent),
            prerequisites: extractPrerequisites(markdownContent),
            quizQuestions: generateQuizQuestions(markdownContent),
          });
        }
        
        // Check if lesson is completed (would use localStorage for demo or API in real app)
        const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        if (completedLessons.includes(`module${moduleId}_lesson${lessonId}`)) {
          setQuizCompleted(true);
          // Only set lessonCompleted if the redirect hasn't happened yet
          // This prevents the completion overlay from showing again after navigating away
          const redirectedLessons = JSON.parse(localStorage.getItem('redirectedLessons') || '[]');
          if (!redirectedLessons.includes(`module${moduleId}_lesson${lessonId}`)) {
            setLessonCompleted(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading lesson:', error);
        setLoading(false);
      }
    };

    fetchLesson();
    
    // Reset lesson completed state when unmounting to prevent persistence issues
    // This ensures the completion overlay doesn't linger between navigation
    return () => {
      setLessonCompleted(false);
    };
  }, [moduleId, lessonId]);

  /**
   * Extracts all sections starting with ##### from markdown content
   * Creates an array of section objects with id, title, and content for tab navigation
   * Each section becomes its own tab for more granular navigation
   * 
   * @param {string} markdown - The raw markdown content
   * @returns {Array} - Array of section objects with id, title, and content
   */
  const extractSections = (markdown) => {
    // Split content by heading level 5 (##### heading)
    // This regex finds all headings that start with #####
    const sectionRegex = /##### ([^\n]+)/g;
    const sectionMatches = [...markdown.matchAll(sectionRegex)];
    
    // Add Overview as the first tab - this contains content before the first heading
    // This ensures the introduction/overview content is accessible
    const sections = [
      {
        id: 'overview',
        title: 'Overview',
        content: markdown.split('##### ')[0] || ''
      }
    ];
    
    // Process each section found by the regex
    for (let i = 0; i < sectionMatches.length; i++) {
      // Extract title (text after the ##### prefix)
      const sectionTitle = sectionMatches[i][1];
      // Get the starting position of this section in the markdown
      const sectionStart = sectionMatches[i].index;
      // Find where this section ends (at the start of next section or end of document)
      const sectionEnd = i < sectionMatches.length - 1 ? sectionMatches[i+1].index : markdown.length;
      
      // Extract this section's content using the start and end positions
      const sectionContent = markdown.substring(sectionStart, sectionEnd);
      
      // Convert the title to a valid ID for use in tab navigation
      // Replace spaces with hyphens and convert to lowercase
      const sectionId = sectionTitle.toLowerCase().replace(/\s+/g, '-');
      
      // Add this section to our array
      sections.push({
        id: sectionId,
        title: sectionTitle,
        content: sectionContent
      });
    }
    
    // Special handling for Knowledge Check section
    // We want to ensure the quiz interface is shown for this section
    if (markdown.includes('##### Knowledge Check')) {
      const knowledgeCheckContent = markdown.split('##### Knowledge Check')[1]?.split('##### Additional Resources')[0] || '';
      
      // Only add if it's not already in the sections (to avoid duplicates)
      if (!sections.find(s => s.id === 'knowledge-check')) {
        sections.push({
          id: 'knowledge-check',
          title: 'Knowledge Check',
          content: '##### Knowledge Check' + knowledgeCheckContent
        });
      }
    }
    
    return sections;
  };

  /**
   * Extracts the lesson title from markdown content
   * @param {string} markdown - Raw markdown content
   * @returns {string} - Extracted title or default text
   */
  const extractTitle = (markdown) => {
    const titleMatch = markdown.match(/### Lesson [\d.]+: (.*)/);
    return titleMatch ? titleMatch[1] : 'Lesson Title';
  };

  /**
   * Extracts the lesson duration from markdown content
   * @param {string} markdown - Raw markdown content
   * @returns {string} - Extracted duration or default value
   */
  const extractDuration = (markdown) => {
    const durationMatch = markdown.match(/\*\*Duration:\*\* (.*)/);
    return durationMatch ? durationMatch[1] : '25-30 minutes';
  };

  /**
   * Extracts the lesson prerequisites from markdown content
   * @param {string} markdown - Raw markdown content
   * @returns {string} - Extracted prerequisites or default text
   */
  const extractPrerequisites = (markdown) => {
    const prerequisitesMatch = markdown.match(/\*\*Prerequisites:\*\* (.*)/);
    return prerequisitesMatch ? prerequisitesMatch[1] : 'None';
  };

  /**
   * Generates quiz questions from the Knowledge Check section of markdown
   * Parses both multiple choice and open-ended questions
   * 
   * @param {string} markdown - Raw markdown content
   * @returns {Array} - Array of formatted question objects
   */
  const generateQuizQuestions = (markdown) => {
    const knowledgeCheckSection = markdown.split('##### Knowledge Check')[1]?.split('##### Additional Resources')[0];
    
    if (!knowledgeCheckSection) return [];
    
    // Parse questions
    const questions = [];
    const questionMatches = knowledgeCheckSection.matchAll(/(\d+)\. (.*?)(?:\n   a\) (.*?)\n   b\) (.*?)\n   c\) (.*?)\n   d\) (.*?)\n   Answer: ([a-d]\).*?))|(\d+)\. (.*?)\n   Answer: (.*?)(?:\n|$)/g);
    
    for (const match of questionMatches) {
      if (match[2]) {
        // Multiple choice question
        questions.push({
          id: match[1],
          type: 'multiple-choice',
          question: match[2].trim(),
          options: [
            { id: 'a', text: match[3].trim() },
            { id: 'b', text: match[4].trim() },
            { id: 'c', text: match[5].trim() },
            { id: 'd', text: match[6].trim() }
          ],
          correctAnswer: match[7].trim().charAt(0)
        });
      } else if (match[9]) {
        // Open-ended question
        questions.push({
          id: match[8],
          type: 'open-ended',
          question: match[9].trim(),
          correctAnswer: match[10].trim()
        });
      }
    }
    
    return questions;
  };

  /**
   * Handles quiz submission
   * In a real app, this would validate answers, but for demo purposes
   * it simply marks the quiz as completed and proceeds to mark the lesson complete
   * 
   * @param {Event} e - Form submission event
   */
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    // In a real app, check answers and update progress
    setQuizCompleted(true);
    // After quiz is done, can mark lesson as completed
    markLessonAsCompleted();
  };
  
  /**
   * Marks the current lesson as completed
   * Updates localStorage to track user progress and handles redirection to next lesson
   * Fixes the redirection issue by storing redirected lessons
   */
  const markLessonAsCompleted = () => {
    // In a real app, would call API to update progress
    // For demo, use localStorage to track completion
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    const lessonKey = `module${moduleId}_lesson${lessonId}`;
    
    if (!completedLessons.includes(lessonKey)) {
      completedLessons.push(lessonKey);
      localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }
    
    setLessonCompleted(true);
    
    // Show completion animation before navigating
    setTimeout(() => {
      // Store that we've redirected from this lesson to avoid showing completion overlay again
      // This fixes the issue where the overlay persists after redirection
      const redirectedLessons = JSON.parse(localStorage.getItem('redirectedLessons') || '[]');
      if (!redirectedLessons.includes(lessonKey)) {
        redirectedLessons.push(lessonKey);
        localStorage.setItem('redirectedLessons', JSON.stringify(redirectedLessons));
      }
      
      // Calculate next lesson
      const nextLessonId = parseInt(lessonId) + 1;
      if (nextLessonId <= 5) {
        navigate(`/dashboard/learning/module/${moduleId}/lesson/${nextLessonId}`);
      } else {
        // If last lesson in module, go back to learning paths
        navigate('/dashboard/learning-paths');
      }
    }, 3000);
  };

  /**
   * Handler for the "Mark Lesson as Completed" button
   * Wrapper for markLessonAsCompleted to use as click handler
   */
  const handleMarkComplete = () => {
    markLessonAsCompleted();
  };

  /**
   * Determines if a tab is the Knowledge Check tab
   * Used to display quiz interface instead of markdown content
   * 
   * @param {string} tabId - The ID of the tab to check
   * @returns {boolean} - True if this is the Knowledge Check tab
   */
  const isKnowledgeCheckTab = (tabId) => {
    return tabId === 'knowledge-check';
  };

  // Show loading state while fetching content
  if (loading) {
    return <div className="lesson-loading">Loading lesson content...</div>;
  }

  // Show error state if lesson content couldn't be loaded
  if (!lesson) {
    return <div className="lesson-error">Lesson not found</div>;
  }

  return (
    <div className="lesson-detail-container">
      {/* Completion overlay that appears when a lesson is completed */}
      {lessonCompleted && (
        <div className="lesson-completion-overlay">
          <div className="completion-content">
            <FiAward className="completion-icon" />
            <h2>Lesson Completed!</h2>
            <p>Great job! You've completed this lesson.</p>
            <p className="redirect-message">Redirecting to next lesson...</p>
          </div>
        </div>
      )}
      
      {/* Lesson header with title and metadata */}
      <div className="lesson-header">
        <Link to="/dashboard/learning-paths" className="back-button">
          <FiArrowLeft /> Back to Learning Paths
        </Link>
        <h1>{lesson.title}</h1>
        <div className="lesson-meta">
          <span className="lesson-duration"><FiClock /> {lesson.duration}</span>
          <span className="lesson-prerequisites"><FiBookOpen /> Prerequisites: {lesson.prerequisites}</span>
          {quizCompleted && (
            <span className="lesson-completed-badge">
              <FiCheckCircle /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Navigation tabs for each section */}
      <div className="lesson-tabs section-tabs">
        {sectionTabs.map(section => (
          <button 
            key={section.id}
            className={`lesson-tab ${activeTab === section.id ? 'active' : ''}`}
            onClick={() => setActiveTab(section.id)}
          >
            {section.title}
          </button>
        ))}
        {/* Completion button tab always at the end */}
        <button 
          className={`lesson-tab completion-tab ${activeTab === 'completion' ? 'active' : ''}`}
          onClick={() => setActiveTab('completion')}
        >
          <FiCheckCircle /> Complete Lesson
        </button>
      </div>
      
      {/* Lesson content container that displays the active tab */}
      <div className="lesson-content-container">
        {/* Content varies based on active tab */}
        {activeTab === 'completion' ? (
          // Completion tab
          <div className="quiz-completed">
            <FiCheckCircle size={48} />
            <h3>Ready to Complete this Lesson?</h3>
            <p>Click the button below to mark this lesson as completed and proceed to the next lesson.</p>
            <button 
              className="next-lesson-btn"
              onClick={handleMarkComplete}
            >
              Mark Lesson as Completed
            </button>
          </div>
        ) : isKnowledgeCheckTab(activeTab) ? (
          // Knowledge Check tab - display quiz interface
          <div className="quiz-container">
            {quizCompleted ? (
              <div className="quiz-completed">
                <FiCheckCircle size={48} />
                <h3>Knowledge Check Completed!</h3>
                <p>You've successfully completed this lesson's knowledge check.</p>
                <button 
                  className="next-lesson-btn"
                  onClick={() => setActiveTab('completion')}
                >
                  Continue to Complete Lesson
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuizSubmit} className="quiz-form">
                <h3>Knowledge Check</h3>
                <p>Test your understanding of the key concepts from this lesson.</p>
                
                {lesson.quizQuestions.map(question => (
                  <div key={question.id} className="quiz-question">
                    <h4>{question.id}. {question.question}</h4>
                    
                    {question.type === 'multiple-choice' ? (
                      <div className="question-options">
                        {question.options.map(option => (
                          <label key={option.id} className="option-label">
                            <input 
                              type="radio" 
                              name={`question-${question.id}`} 
                              value={option.id} 
                            />
                            <span>{option.id}) {option.text}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea 
                        className="open-question-input"
                        placeholder="Type your answer here..."
                        rows={4}
                      />
                    )}
                  </div>
                ))}
                
                <button type="submit" className="submit-quiz-btn">Submit Answers</button>
              </form>
            )}
          </div>
        ) : (
          // Standard content tab - display section markdown
          <div className="section-content-tab">
            {/* Find and display the content for this tab */}
            {sectionTabs.find(section => section.id === activeTab) && (
              <div className="markdown-content">
                <ReactMarkdown>
                  {sectionTabs.find(section => section.id === activeTab).content}
                </ReactMarkdown>
                
                {/* Add a 'Next Section' button if this isn't the last section */}
                {activeTab !== 'completion' && (
                  <div className="section-navigation">
                    <button 
                      className="next-section-btn"
                      onClick={() => {
                        // Find the current section index
                        const currentIndex = sectionTabs.findIndex(section => section.id === activeTab);
                        // If not the last section, go to next section
                        if (currentIndex < sectionTabs.length - 1) {
                          setActiveTab(sectionTabs[currentIndex + 1].id);
                        } else {
                          // If the last section, go to completion
                          setActiveTab('completion');
                        }
                      }}
                    >
                      Next Section →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonDetail; 