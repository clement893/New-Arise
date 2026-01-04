'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import Container from '@/components/ui/Container';
import { Card, Stack } from '@/components/ui';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';

function TestsContent() {
  return (
    <Container>
      <MotionDiv variant="fade" duration="normal">
        <div className="mb-8 pb-6">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Vos </span>
            <span style={{ color: '#D5B667' }}>tests</span>
          </h1>
          <p className="text-white">
            Suivez et gérez vos tests
          </p>
        </div>
      </MotionDiv>

      {/* Wrapper for tests with background color block */}
      <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
        {/* Background color block behind all tests */}
        <div 
          className="absolute"
          style={{ 
            backgroundColor: '#D5DEE0',
            top: '-20px',
            bottom: 0,
            left: '-15%',
            right: '-15%',
            width: 'calc(100% + 30%)',
            zIndex: 0,
            borderRadius: '16px',
          }}
        />
        
        {/* Content sections with relative positioning */}
        <div className="relative z-10">
          <MotionDiv variant="slideUp" delay={100}>
            <Stack gap="normal">
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#e7eeef' }}
                      >
                        <div className="text-arise-deep-teal text-2xl font-bold">
                          T
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Tests
                        </h3>
                        <p className="text-sm text-gray-600">
                          Gestion de vos tests
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Stack>
          </MotionDiv>
        </div>
      </div>
    </Container>
  );
}

export default function TestsPage() {
  return (
    <ErrorBoundary showDetails={false}>
      <TestsContent />
    </ErrorBoundary>
  );
}
