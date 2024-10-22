import { FC, useMemo, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import RatingControl from './RatingControl';
import ratingControlTester from '../ratingControlTester';
import schema from '../schema.json';
import uischema from '../uischema.json';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
});
addFormats(ajv);

const classes = {
  container: {
    padding: '1em',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    padding: '0.25em',
  },
  dataContent: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0.25em',
    backgroundColor: '#cecece',
    marginBottom: '1rem',
  },
  resetButton: {
    margin: 'auto !important',
    display: 'block !important',
  },
  demoform: {
    margin: 'auto',
    padding: '1rem',
  },
};

const initialData = {
  "comments": [
    {
      "name": "John Doe",
      "message": "This is an example message"
    },
    {
      "name": "Max Mustermann",
      "message": "Another message"
    }
  ]
}

const renderers = [
  ...materialRenderers,
  //register custom renderers
  { tester: ratingControlTester, renderer: RatingControl },
];

/**
 * The `JsonFormsDemo` component is a React functional component that renders a form using the `JsonForms` library. It displays the bound data in a pre-formatted block and provides a button to clear the data.
 *
 * The component uses the `useState` and `useMemo` hooks to manage the state of the form data and the stringified version of the data. It also handles custom validation errors and displays them in the form.
 *
 * The `JsonForms` component is configured with a schema, UI schema, renderers, and cells. The `onChange` callback is used to update the form data and handle custom validation errors.
 */
export const JsonFormsDemo: FC = () => {
  const [data, setData] = useState<object>(initialData);
  const stringifiedData = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const [additionalErrors, setAdditionalErrors] = useState<ErrorObject[]>([]);

  const clearData = () => {
    setData({});
  };
  return (
    <Grid
      container
      justifyContent={'center'}
      spacing={1}
      style={classes.container}>
      <Grid item sm={6}>
        <Typography variant={'h4'}>Bound data</Typography>
        <div style={classes.dataContent}>
          <pre id="boundData">{stringifiedData}</pre>
        </div>
        <Button
          style={classes.resetButton}
          onClick={clearData}
          color="primary"
          variant="contained"
          data-testid="clear-data">
          Clear data
        </Button>
      </Grid>
      <Grid item sm={6}>
        <Typography variant={'h4'}>Rendered form</Typography>
        <div style={classes.demoform}>
          <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={renderers}
            cells={materialCells}
            onChange={({ data, errors }) => {
                setData(data);
                
                const customErrors: ErrorObject[] = [];
                const nameSet = new Set();
                const messageSet = new Set();
              
                data.comments?.forEach((comment: { name?: string; message?: string }, index: number) => {
                  if (!comment.name) {
                    customErrors.push({
                      instancePath: `/comments/${index}/name`,
                      message: `Name is required for comment ${index + 1}`,
                      schemaPath: '',
                      keyword: 'required',
                      params: {}
                    });
                  } else if (nameSet.has(comment.name)) {
                    customErrors.push({
                      instancePath: `/comments/${index}/name`,
                      message: `Duplicate name: ${comment.name}`,
                      schemaPath: '',
                      keyword: 'unique',
                      params: {}
                    });
                  } else {
                    nameSet.add(comment.name);
                  }
              
                  if (!comment.message) {
                    customErrors.push({
                      instancePath: `/comments/${index}/message`,
                      message: `Message is required for comment ${index + 1}`,
                      schemaPath: '',
                      keyword: 'required',
                      params: {}
                    });
                  } else if (messageSet.has(comment.message)) {
                    customErrors.push({
                      instancePath: `/comments/${index}/message`,
                      message: `Duplicate message: ${comment.message}`,
                      schemaPath: '',
                      keyword: 'unique',
                      params: {}
                    });
                  } else {
                    messageSet.add(comment.message);
                  }
                });              
                setAdditionalErrors(customErrors);
              
                console.log('All errors:', [...customErrors]);
              }}                          
            
            validationMode='ValidateAndShow'
            additionalErrors={additionalErrors}
          />
        </div>
      </Grid>
    </Grid>
  );
};