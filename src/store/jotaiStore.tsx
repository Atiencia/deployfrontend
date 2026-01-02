import {atomWithStorage} from 'jotai/utils'
import type { Subevento } from '../../types/evento';
import { atom } from 'jotai';

export const userRolAtom = atomWithStorage('userRol', 0);

export const subgruposAtom = atom<Subevento[]>()
