'use client'

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { QuestionTable } from "@/components/Table/QuestionTable";
import { UsersTable } from "@/components/Table/UsersTable";
import { Exception } from "@/types/exception";
import { User } from "@/types/user";
import { ApiMethod, apiV1 } from "@/utils/api";
import { mbtiMapping } from "@/utils/utils";
import { Anchor, Breadcrumbs, Button, Card, ComboboxItem, Grid, GridCol, Group, Modal, PasswordInput, Radio, Select, Text, Textarea, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { MappingQuestion } from "@prisma/client";
import { JsonArray } from "@prisma/client/runtime/library";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const MappingPage = () => {
  const [data, setData] = useState<Array<MappingQuestion>>([]);
  const [questionDetail, setQuestion] = useState<MappingQuestion | undefined>();
  const [selectedId, setId] = useState<string | undefined>();
  const [addModalOpen, openAddModal] = useState(false);
  const [confirmDeleteOpen, openConfirmDelete] = useState(false);
  const [editModalOpen, openEditModal] = useState(false);

  useEffect(() => {
    getData();
  }, [])

  const getData = async () => {
    try {
      const mapping = await apiV1<Array<MappingQuestion>>({ path: '/api/mappings', method: ApiMethod.GET });
      setData(mapping!);
    } catch (e) {
      const exception = e as Exception;

      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setQuestion({ ...questionDetail!, [name]: value })
  }

  const handleRadio = (value: string, index: number) => {
    let category = questionDetail?.category as JsonArray;
    category[index] = value;
    setQuestion({ ...questionDetail!, category: category })
  }

  const handleSubmitEdit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await apiV1<MappingQuestion>({ path: `/api/mapping/${selectedId}`, method: ApiMethod.POST, body: questionDetail });
      openEditModal(false);
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "Question has been updated",
        position: 'top-center'
      })
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const actionDelete = (id: number) => {
    setId(id.toString());
    openConfirmDelete(true)
  }

  const deleteQuestion = async () => {
    try {
      const user = await apiV1<MappingQuestion>({ path: `/api/mapping/${selectedId}`, method: ApiMethod.DELETE });
      openConfirmDelete(false)
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "Question has been deleted",
        position: 'top-center'
      })
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const actionEdit = async (id: number) => {
    try {
      setId(id.toString());
      const response = await apiV1<MappingQuestion>({ method: ApiMethod.GET, path: `/api/mapping/${id}` });
      setQuestion(response);
      openEditModal(true)
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  return <>
    <PageContainer title="Question">
      <Modal opened={editModalOpen} onClose={() => openEditModal(false)} size='lg' title="Edit Question" centered>
        <form onSubmit={handleSubmitEdit}>
          <Textarea name="first" onChange={handleChange} placeholder="Question A" label="Question A" value={questionDetail?.first} required></Textarea>
          {
            questionDetail ?
              <Group my="md">
                <Radio onClick={() => handleRadio("I", 0)} value="I" label="Introvert" checked={(questionDetail?.category as JsonArray)[0] == "I"} />
                <Radio onClick={() => handleRadio("S", 0)} value="S" label="Sensing" checked={(questionDetail?.category as JsonArray)[0] == "S"} />
                <Radio onClick={() => handleRadio("T", 0)} value="T" label="Thinking" checked={(questionDetail?.category as JsonArray)[0] == "T"} />
                <Radio onClick={() => handleRadio("J", 0)} value="J" label="Judging" checked={(questionDetail?.category as JsonArray)[0] == "J"} />
                <Radio onClick={() => handleRadio("E", 0)} value="E" label="Extrovert" checked={(questionDetail?.category as JsonArray)[0] == "E"} />
                <Radio onClick={() => handleRadio("N", 0)} value="N" label="Intuition" checked={(questionDetail?.category as JsonArray)[0] == "N"} />
                <Radio onClick={() => handleRadio("F", 0)} value="F" label="Feeling" checked={(questionDetail?.category as JsonArray)[0] == "F"} />
                <Radio onClick={() => handleRadio("P", 0)} value="P" label="Perceiving" checked={(questionDetail?.category as JsonArray)[0] == "P"} />
              </Group> : <></>
          }
          <Textarea name="second" onChange={handleChange} placeholder="Question B" label="Question B" value={questionDetail?.second} required></Textarea>
          {
            questionDetail ?
              <Group my="md">
                <Radio onClick={() => handleRadio("I", 1)} value="I" label="Introvert" checked={(questionDetail?.category as JsonArray)[1] == "I"} />
                <Radio onClick={() => handleRadio("S", 1)} value="S" label="Sensing" checked={(questionDetail?.category as JsonArray)[1] == "S"} />
                <Radio onClick={() => handleRadio("T", 1)} value="T" label="Thinking" checked={(questionDetail?.category as JsonArray)[1] == "T"} />
                <Radio onClick={() => handleRadio("J", 1)} value="J" label="Judging" checked={(questionDetail?.category as JsonArray)[1] == "J"} />
                <Radio onClick={() => handleRadio("E", 1)} value="E" label="Extrovert" checked={(questionDetail?.category as JsonArray)[1] == "E"} />
                <Radio onClick={() => handleRadio("N", 1)} value="N" label="Intuition" checked={(questionDetail?.category as JsonArray)[1] == "N"} />
                <Radio onClick={() => handleRadio("F", 1)} value="F" label="Feeling" checked={(questionDetail?.category as JsonArray)[1] == "F"} />
                <Radio onClick={() => handleRadio("P", 1)} value="P" label="Perceiving" checked={(questionDetail?.category as JsonArray)[1] == "P"} />
              </Group> : <></>
          }
          <Button mt='xl' fullWidth={true} type="submit">Save</Button>
        </form>
      </Modal>

      <Modal opened={confirmDeleteOpen} onClose={() => openConfirmDelete(false)} title="Delete User" centered>
        <Text>Are you sure wanna delete this question?</Text>
        <Group mt="xl" justify="right">
          <Button color="red" onClick={() => deleteQuestion()}>Delete</Button>
          <Button variant="outline" onClick={() => openConfirmDelete(false)} type="submit">Cancel</Button>
        </Group>
      </Modal>

      <Grid>
        <GridCol className="text-left" span={12}>
          <Breadcrumbs>
            <Anchor href="/dashboard">
              Dashboard
            </Anchor>
            <Anchor href="/dashboard/mapping">
              Mapping
            </Anchor>
          </Breadcrumbs>
        </GridCol>
        {/* <GridCol className="text-right" span={12}>
          <Group>
            <Button onClick={() => openAddModal(true)}>Add Question</Button>
          </Group>
        </GridCol> */}
        <GridCol span={12}>
          <QuestionTable data={data} deleteQuestion={actionDelete} editQuestion={actionEdit} />
        </GridCol>
      </Grid>
    </PageContainer>

  </>
}

export default MappingPage;