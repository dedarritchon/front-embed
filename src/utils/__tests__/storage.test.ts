import { validateImportedSettings, importSettings } from '../storage';

describe('Settings Import Validation', () => {
  describe('validateImportedSettings', () => {
    it('should validate correct settings format', () => {
      const validSettings = {
        iframeConfigs: [
          {
            id: 'config1',
            name: 'Test Config',
            embedCode: '<iframe src="test.com"></iframe>'
          }
        ],
        activeIframeId: 'config1'
      };

      const result = validateImportedSettings(JSON.stringify(validSettings));
      
      expect(result.isValid).toBe(true);
      expect(result.settings).toEqual(validSettings);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid JSON', () => {
      const result = validateImportedSettings('invalid json');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid JSON format. Please check your import data.');
      expect(result.settings).toBeUndefined();
    });

    it('should reject settings with missing required fields', () => {
      const invalidSettings = {
        iframeConfigs: [
          {
            id: 'config1',
            name: 'Test Config'
            // missing embedCode
          }
        ]
      };

      const result = validateImportedSettings(JSON.stringify(invalidSettings));
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid settings format');
    });

    it('should reject settings with empty required fields', () => {
      const invalidSettings = {
        iframeConfigs: [
          {
            id: '',
            name: 'Test Config',
            embedCode: '<iframe src="test.com"></iframe>'
          }
        ]
      };

      const result = validateImportedSettings(JSON.stringify(invalidSettings));
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid settings format');
    });

    it('should reject settings with duplicate IDs', () => {
      const invalidSettings = {
        iframeConfigs: [
          {
            id: 'config1',
            name: 'Test Config 1',
            embedCode: '<iframe src="test1.com"></iframe>'
          },
          {
            id: 'config1', // duplicate ID
            name: 'Test Config 2',
            embedCode: '<iframe src="test2.com"></iframe>'
          }
        ]
      };

      const result = validateImportedSettings(JSON.stringify(invalidSettings));
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid settings: duplicate configuration IDs found');
    });

    it('should reject settings with invalid activeIframeId', () => {
      const invalidSettings = {
        iframeConfigs: [
          {
            id: 'config1',
            name: 'Test Config',
            embedCode: '<iframe src="test.com"></iframe>'
          }
        ],
        activeIframeId: 'nonexistent-id'
      };

      const result = validateImportedSettings(JSON.stringify(invalidSettings));
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid settings: activeIframeId does not match any configuration ID');
    });

    it('should accept settings without activeIframeId', () => {
      const validSettings = {
        iframeConfigs: [
          {
            id: 'config1',
            name: 'Test Config',
            embedCode: '<iframe src="test.com"></iframe>'
          }
        ]
        // no activeIframeId
      };

      const result = validateImportedSettings(JSON.stringify(validSettings));
      
      expect(result.isValid).toBe(true);
      expect(result.settings).toEqual(validSettings);
    });
  });

  describe('importSettings', () => {
    it('should throw error for invalid settings', () => {
      expect(() => {
        importSettings('invalid json');
      }).toThrow('Invalid JSON format. Please check your import data.');
    });

    it('should return valid settings for correct input', () => {
      const validSettings = {
        iframeConfigs: [
          {
            id: 'config1',
            name: 'Test Config',
            embedCode: '<iframe src="test.com"></iframe>'
          }
        ]
      };

      const result = importSettings(JSON.stringify(validSettings));
      expect(result).toEqual(validSettings);
    });
  });
});
