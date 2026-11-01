import React from 'react';
import { act, render } from '@testing-library/react-native';
import { FaceIllustration, guideForTouch } from '../FaceIllustration';
import { FaceZoneThumb } from '../FaceZoneThumb';
import { FACE_TONES, FACE_TONE_LABELS, FaceTone } from '../faceParts';
import { circleTrack, pressTrack, slideTrack } from '../motions';
import { exercises } from '../../../data/exercises';
import { useStore } from '../../../store/useStore';

describe('Guides de trajectoire des doigts', () => {
  it('ignore une simple pression (trajet trop court)', () => {
    expect(guideForTouch(pressTrack(100, 150, 2))).toBeNull();
  });

  it('trace un pointillé avec flèche pour un glissé', () => {
    const guide = guideForTouch(slideTrack([92, 68], [50, 80]));
    expect(guide).not.toBeNull();
    expect(guide?.d).toBe('M 92 68 L 50 80');
    expect(guide?.arrow).toMatch(/^M 50(\.00)? 80(\.00)? L /);
  });

  it('ferme le tracé pour un cercle', () => {
    const guide = guideForTouch(circleTrack(46, 86, 5));
    expect(guide?.d.endsWith(' Z')).toBe(true);
    expect(guide?.arrow).toBeTruthy();
  });
});

describe('Carnations', () => {
  it('propose quatre carnations complètes et libellées', () => {
    const tones = Object.keys(FACE_TONES) as FaceTone[];
    expect(tones).toEqual(['light', 'medium', 'tan', 'deep']);
    tones.forEach((tone) => {
      expect(FACE_TONE_LABELS[tone]).toBeTruthy();
      expect(FACE_TONES[tone].skin).toMatch(/^#[0-9A-F]{6}$/i);
      expect(FACE_TONES[tone].iris).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('rend le visage avec la carnation forcée ou celle des réglages', async () => {
    const first = await render(<FaceIllustration zone="global" tone="deep" animated={false} size={80} />);
    await first.unmount();
    useStore.getState().updateSettings({ illustrationTone: 'tan' });
    expect(useStore.getState().user.settings.illustrationTone).toBe('tan');
    const second = await render(<FaceZoneThumb zone="joues" size={40} />);
    await second.unmount();
    useStore.getState().updateSettings({ illustrationTone: 'medium' });
  });
});

describe('FaceIllustration rendering', () => {
  it('rend une pose statique avec la consigne', async () => {
    const { getByText, getByTestId } = await render(
      <FaceIllustration exerciseId="ex-bouche-001" animated={false} showCaption testID="face" />
    );
    expect(getByTestId('face')).toBeTruthy();
    expect(getByText(/grand « O »/)).toBeTruthy();
  });

  it('rend chaque exercice sans erreur (animation désactivée)', async () => {
    for (const exercise of exercises) {
      const { unmount } = await render(
        <FaceIllustration exerciseId={exercise.id} zone={exercise.zone} animated={false} size={120} />
      );
      await unmount();
    }
  });

  it('démarre et arrête la boucle animée sans fuite', async () => {
    jest.useFakeTimers();
    const { unmount } = await render(<FaceIllustration exerciseId="ex-front-003" animated size={120} />);
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await unmount();
    jest.useRealTimers();
  });

  it('rend une vignette par zone', async () => {
    const zones = ['front', 'yeux', 'joues', 'bouche', 'ovale', 'cou', 'global'] as const;
    for (const zone of zones) {
      const { unmount } = await render(<FaceZoneThumb zone={zone} size={48} />);
      await unmount();
    }
  });
});
