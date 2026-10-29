import React from 'react';
import { act, render } from '@testing-library/react-native';
import { FaceIllustration } from '../FaceIllustration';
import { FaceZoneThumb } from '../FaceZoneThumb';
import { exercises } from '../../../data/exercises';

describe('FaceIllustration rendering', () => {
  it('rend une pose statique avec la consigne', () => {
    const { getByText, getByTestId } = render(
      <FaceIllustration exerciseId="ex-bouche-001" animated={false} showCaption testID="face" />
    );
    expect(getByTestId('face')).toBeTruthy();
    expect(getByText(/grand « O »/)).toBeTruthy();
  });

  it('rend chaque exercice sans erreur (animation désactivée)', () => {
    exercises.forEach((exercise) => {
      const { unmount } = render(
        <FaceIllustration exerciseId={exercise.id} zone={exercise.zone} animated={false} size={120} />
      );
      unmount();
    });
  });

  it('démarre et arrête la boucle animée sans fuite', () => {
    jest.useFakeTimers();
    const { unmount } = render(<FaceIllustration exerciseId="ex-front-003" animated size={120} />);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    unmount();
    jest.useRealTimers();
  });

  it('rend une vignette par zone', () => {
    const zones = ['front', 'yeux', 'joues', 'bouche', 'ovale', 'cou', 'global'] as const;
    zones.forEach((zone) => {
      const { unmount } = render(<FaceZoneThumb zone={zone} size={48} />);
      unmount();
    });
  });
});
